/**
 * Static Analysis Extractor
 *
 * Uses TypeScript AST to trace import chains and find actual runtime calls.
 * This solves the problem where hooks in states/*.ts import from api/*.ts,
 * and we need to trace through to find the actual papi.query.* / api.tx.* calls.
 */

import { join, relative, dirname } from 'path';
import { Project, SourceFile, Node, CallExpression } from 'ts-morph';
import { createLogger } from '../utils/logger.js';
import { writeJSON, writeFile } from '../utils/files.js';
import { type CanonicalEdge, type EdgeType, runtime, ui } from '../schemas/canonical-ids.js';

const log = createLogger('static-analysis');

// Pattern matchers for runtime calls
const RUNTIME_CALL_PATTERNS = [
  // papi.query.Pallet.Storage - Polkadot API queries
  /^papi\.query\.(\w+)\.(\w+)/,
  // papi.tx.Pallet.call - Polkadot API transactions
  /^papi\.tx\.(\w+)\.(\w+)/,
  // api.query.Pallet.storage - Legacy Polkadot.js queries
  /^api\.query\.(\w+)\.(\w+)/,
  // api.tx.Pallet.call - Legacy Polkadot.js transactions
  /^api\.tx\.(\w+)\.(\w+)/,
  // this.api.query.Pallet.Storage - SDK class methods
  /^this\.api\.query\.(\w+)\.(\w+)/,
  // this.api.tx.Pallet.call - SDK class tx methods
  /^this\.api\.tx\.(\w+)\.(\w+)/,
  // this.api.constants.Pallet.Constant - SDK constants
  /^this\.api\.constants\.(\w+)\.(\w+)/,
  // this.api.apis.ApiName.method - SDK runtime APIs
  /^this\.api\.apis\.(\w+)\.(\w+)/,
  // sdk.api.module.method - SDK wrapper
  /^sdk\.api\.(\w+)\.(\w+)/,
  // sdk.client.module.method - SDK client
  /^sdk\.client\.(\w+)\.(\w+)/,
];

export interface RuntimeCall {
  type: 'query' | 'tx' | 'const' | 'api' | 'sdk';
  pattern: string; // Original matched pattern
  pallet: string;
  item: string;
  file: string;
  line: number;
}

export interface FunctionAnalysis {
  name: string;
  file: string;
  line: number;
  isExported: boolean;
  isHook: boolean;
  imports: ImportedFunction[];
  directCalls: RuntimeCall[];
  calledFunctions: string[]; // Local function names called
}

export interface ImportedFunction {
  name: string;
  alias?: string; // If imported as different name
  sourceModule: string; // The import path
  resolvedFile?: string; // Resolved absolute path
}

export interface FileAnalysis {
  file: string;
  functions: FunctionAnalysis[];
  exports: string[];
}

/**
 * Store definition (Zustand, Jotai, Redux, etc.)
 */
export interface Store {
  name: string;
  file: string;
  line: number;
  type: 'zustand' | 'jotai' | 'redux' | 'context' | 'custom';
  setters: string[]; // Setter function names
  readers: string[]; // Hooks that read from this store
  writers: string[]; // Hooks that write to this store
}

export interface StaticAnalysisResult {
  meta: {
    extractedAt: string;
    filesAnalyzed: number;
    hooksFound: number;
    runtimeCallsFound: number;
    storesFound: number;
    edgesFound: number;
  };
  files: FileAnalysis[];
  hooks: HookTrace[];
  callGraph: CallGraphEdge[];
  stores: Store[];
  edges: CanonicalEdge[];  // Unified edges array (reads, writes, queries, calls)
}

export interface HookTrace {
  name: string;
  file: string;
  line: number;
  runtimeCalls: RuntimeCall[];
  importedCalls: Array<{
    through: string; // Function name imported
    fromFile: string;
    calls: RuntimeCall[];
  }>;
}

export interface CallGraphEdge {
  from: string; // function@file
  to: string; // function@file or runtime:call
  type: 'calls' | 'imports' | 'runtime';
}

interface ExtractOptions {
  repoPath: string;
  outputPath: string;
  patterns?: string[];
  layer?: 'ui' | 'sdk';
}

/**
 * Analyze a single source file
 */
function analyzeFile(sourceFile: SourceFile, repoPath: string): FileAnalysis {
  const relativePath = relative(repoPath, sourceFile.getFilePath());
  const functions: FunctionAnalysis[] = [];
  const exports: string[] = [];

  // Get all imports
  const importMap = new Map<string, ImportedFunction>();
  for (const importDecl of sourceFile.getImportDeclarations()) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();

    for (const namedImport of importDecl.getNamedImports()) {
      const name = namedImport.getName();
      const alias = namedImport.getAliasNode()?.getText();
      const localName = alias || name;

      importMap.set(localName, {
        name,
        alias: alias !== name ? alias : undefined,
        sourceModule: moduleSpecifier,
      });
    }

    // Default imports
    const defaultImport = importDecl.getDefaultImport();
    if (defaultImport) {
      importMap.set(defaultImport.getText(), {
        name: 'default',
        sourceModule: moduleSpecifier,
      });
    }
  }

  // Find all function declarations and arrow functions
  const analyzeFunctionBody = (
    name: string,
    node: Node,
    startLine: number,
    isExported: boolean
  ): FunctionAnalysis => {
    const directCalls: RuntimeCall[] = [];
    const calledFunctions: string[] = [];
    const imports: ImportedFunction[] = [];

    // Find all call expressions in this function
    node.forEachDescendant((descendant) => {
      if (Node.isCallExpression(descendant)) {
        const callText = getCallExpressionText(descendant);
        if (callText) {
          // Check if it matches a runtime call pattern
          const runtimeCall = parseRuntimeCall(callText, relativePath, descendant.getStartLineNumber());
          if (runtimeCall) {
            directCalls.push(runtimeCall);
          } else {
            // Check if it's calling an imported function
            const calledName = getCalledFunctionName(descendant);
            if (calledName) {
              if (importMap.has(calledName)) {
                const imp = importMap.get(calledName)!;
                if (!imports.find(i => i.name === imp.name && i.sourceModule === imp.sourceModule)) {
                  imports.push(imp);
                }
              }
              calledFunctions.push(calledName);
            }
          }
        }
      }
    });

    return {
      name,
      file: relativePath,
      line: startLine,
      isExported,
      isHook: name.startsWith('use'),
      imports,
      directCalls,
      calledFunctions,
    };
  };

  // Function declarations
  for (const func of sourceFile.getFunctions()) {
    const name = func.getName();
    if (!name) continue;

    const isExported = func.isExported();
    if (isExported) exports.push(name);

    functions.push(analyzeFunctionBody(name, func, func.getStartLineNumber(), isExported));
  }

  // Variable declarations with arrow functions (const useHook = () => {})
  for (const varStmt of sourceFile.getVariableStatements()) {
    const isExported = varStmt.isExported();

    for (const decl of varStmt.getDeclarations()) {
      const name = decl.getName();
      const init = decl.getInitializer();

      if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) {
        if (isExported) exports.push(name);
        functions.push(analyzeFunctionBody(name, init, decl.getStartLineNumber(), isExported));
      }
    }
  }

  // Class declarations and their methods (for SDK analysis)
  for (const classDecl of sourceFile.getClasses()) {
    const className = classDecl.getName();
    if (!className) continue;

    const isExported = classDecl.isExported();
    if (isExported) exports.push(className);

    // Analyze class methods
    for (const method of classDecl.getMethods()) {
      const methodName = method.getName();
      const fullName = `${className}.${methodName}`;

      // Methods are considered "exported" if the class is exported
      functions.push(analyzeFunctionBody(fullName, method, method.getStartLineNumber(), isExported));
    }

    // Analyze class properties that are arrow functions
    for (const prop of classDecl.getProperties()) {
      const propName = prop.getName();
      const init = prop.getInitializer();

      if (init && Node.isArrowFunction(init)) {
        const fullName = `${className}.${propName}`;
        functions.push(analyzeFunctionBody(fullName, init, prop.getStartLineNumber(), isExported));
      }
    }
  }

  return { file: relativePath, functions, exports };
}

/**
 * Get the full text of a call expression (e.g., "papi.query.Balances.Locks")
 */
function getCallExpressionText(callExpr: CallExpression): string | null {
  const expr = callExpr.getExpression();

  // Handle property access chains like papi.query.Balances.Locks.getValue
  if (Node.isPropertyAccessExpression(expr)) {
    const parts: string[] = [];
    let current: Node = expr;

    while (Node.isPropertyAccessExpression(current)) {
      parts.unshift(current.getName());
      current = current.getExpression();
    }

    if (Node.isIdentifier(current)) {
      parts.unshift(current.getText());
    }

    return parts.join('.');
  }

  if (Node.isIdentifier(expr)) {
    return expr.getText();
  }

  return null;
}

/**
 * Get the name of the function being called
 */
function getCalledFunctionName(callExpr: CallExpression): string | null {
  const expr = callExpr.getExpression();

  if (Node.isIdentifier(expr)) {
    return expr.getText();
  }

  if (Node.isPropertyAccessExpression(expr)) {
    // For method calls like obj.method(), we want the root identifier
    let current: Node = expr;
    while (Node.isPropertyAccessExpression(current)) {
      current = current.getExpression();
    }
    if (Node.isIdentifier(current)) {
      return current.getText();
    }
  }

  return null;
}

/**
 * Parse a call expression text to extract runtime call info
 */
function parseRuntimeCall(callText: string, file: string, line: number): RuntimeCall | null {
  for (const pattern of RUNTIME_CALL_PATTERNS) {
    const match = callText.match(pattern);
    if (match) {
      let type: 'query' | 'tx' | 'const' | 'api' | 'sdk' = 'query';
      if (callText.includes('.tx.')) type = 'tx';
      else if (callText.includes('.constants.')) type = 'const';
      else if (callText.includes('.apis.')) type = 'api';
      else if (callText.includes('sdk.')) type = 'sdk';

      return {
        type,
        pattern: callText,
        pallet: match[1],
        item: match[2],
        file,
        line,
      };
    }
  }
  return null;
}

/**
 * Build a map of exported functions by file
 */
function buildExportMap(files: FileAnalysis[]): Map<string, Map<string, FunctionAnalysis>> {
  const map = new Map<string, Map<string, FunctionAnalysis>>();

  for (const file of files) {
    const funcMap = new Map<string, FunctionAnalysis>();
    for (const func of file.functions) {
      if (func.isExported) {
        funcMap.set(func.name, func);
      }
    }
    map.set(file.file, funcMap);
  }

  return map;
}

/**
 * Resolve an import path to an actual file
 */
function resolveImportPath(
  fromFile: string,
  importPath: string,
  repoPath: string,
  fileSet: Set<string>
): string | undefined {
  // Handle @ alias (common in UI repos)
  let resolvedPath = importPath;
  if (importPath.startsWith('@/')) {
    resolvedPath = importPath.replace('@/', 'apps/main/src/');
  } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
    const fromDir = dirname(fromFile);
    resolvedPath = join(fromDir, importPath);
  } else {
    // External package, skip
    return undefined;
  }

  // Try to find the file with various extensions
  const extensions = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
  for (const ext of extensions) {
    const candidate = resolvedPath + ext;
    if (fileSet.has(candidate)) {
      return candidate;
    }
    // Also try without extension if it already has one
    if (fileSet.has(resolvedPath)) {
      return resolvedPath;
    }
  }

  return undefined;
}

/**
 * Trace runtime calls for a hook, following imports
 */
function traceHookCalls(
  hook: FunctionAnalysis,
  exportMap: Map<string, Map<string, FunctionAnalysis>>,
  fileSet: Set<string>,
  repoPath: string,
  visited: Set<string> = new Set()
): HookTrace {
  const trace: HookTrace = {
    name: hook.name,
    file: hook.file,
    line: hook.line,
    runtimeCalls: [...hook.directCalls],
    importedCalls: [],
  };

  const visitKey = `${hook.name}@${hook.file}`;
  if (visited.has(visitKey)) {
    return trace;
  }
  visited.add(visitKey);

  // Follow imports to find more runtime calls
  for (const imp of hook.imports) {
    const resolvedFile = resolveImportPath(hook.file, imp.sourceModule, repoPath, fileSet);
    if (!resolvedFile) continue;

    const fileExports = exportMap.get(resolvedFile);
    if (!fileExports) continue;

    const importedFunc = fileExports.get(imp.name);
    if (!importedFunc) continue;

    // Recursively trace this function
    if (importedFunc.directCalls.length > 0 || importedFunc.imports.length > 0) {
      const subTrace = traceHookCalls(importedFunc, exportMap, fileSet, repoPath, visited);

      const allCalls = [
        ...importedFunc.directCalls,
        ...subTrace.importedCalls.flatMap(ic => ic.calls),
      ];

      if (allCalls.length > 0) {
        trace.importedCalls.push({
          through: imp.name,
          fromFile: resolvedFile,
          calls: allCalls,
        });
      }
    }
  }

  return trace;
}

/**
 * Build call graph edges
 */
function buildCallGraph(files: FileAnalysis[], _exportMap: Map<string, Map<string, FunctionAnalysis>>): CallGraphEdge[] {
  const edges: CallGraphEdge[] = [];

  for (const file of files) {
    for (const func of file.functions) {
      const fromId = `${func.name}@${func.file}`;

      // Runtime call edges
      for (const call of func.directCalls) {
        edges.push({
          from: fromId,
          to: `runtime:${call.type}:${call.pallet}:${call.item}`,
          type: 'runtime',
        });
      }

      // Import edges
      for (const imp of func.imports) {
        edges.push({
          from: fromId,
          to: `${imp.name}@${imp.sourceModule}`,
          type: 'imports',
        });
      }
    }
  }

  return edges;
}

/**
 * Detect state containers (Zustand, Jotai, Redux, etc.)
 */
function detectStores(files: FileAnalysis[], project: Project, repoPath: string): Store[] {
  const stores: Store[] = [];

  // First pass: collect StateCreator helpers and their setters
  const stateCreatorSetters = new Map<string, string[]>();

  for (const sourceFile of project.getSourceFiles()) {
    const text = sourceFile.getFullText();

    // Find StateCreator helper functions: const createXxx: StateCreator<...> = (set...) => ({...})
    const creatorMatches = text.matchAll(/const\s+(\w+):\s*StateCreator[\s\S]*?=\s*\([^)]*set[^)]*\)\s*=>\s*\(\{([\s\S]*?)\}\)/g);
    for (const match of creatorMatches) {
      const creatorName = match[1];
      const body = match[2];

      // Extract setters from the body
      const setters: string[] = [];
      const setterMatches = body.matchAll(/(\w+):\s*\([^)]*\)\s*=>\s*set\(/g);
      for (const sm of setterMatches) {
        setters.push(sm[1]);
      }

      if (setters.length > 0) {
        stateCreatorSetters.set(creatorName, setters);
      }
    }
  }

  // Second pass: find stores
  for (const sourceFile of project.getSourceFiles()) {
    const relativePath = relative(repoPath, sourceFile.getFilePath());

    // Find variable declarations with zustand create()
    for (const varStmt of sourceFile.getVariableStatements()) {
      for (const decl of varStmt.getDeclarations()) {
        const init = decl.getInitializer();
        if (!init) continue;

        const initText = init.getText();
        const name = decl.getName();
        if (!name.startsWith('use')) continue;

        // Detect store type
        let storeType: Store['type'] | null = null;
        const setters: string[] = [];

        // Zustand: create<Type>(...) or create(...)
        if (initText.includes('create') && initText.includes('set')) {
          storeType = 'zustand';

          // Pattern 1: Direct inline setters
          const setterMatches = initText.matchAll(/(\w+):\s*\([^)]*\)\s*=>\s*set\(/g);
          for (const match of setterMatches) {
            setters.push(match[1]);
          }

          // Pattern 2: Spread StateCreator helpers
          const spreadMatches = initText.matchAll(/\.\.\.(\w+)\s*\(/g);
          for (const match of spreadMatches) {
            const creatorName = match[1];
            const creatorSetters = stateCreatorSetters.get(creatorName);
            if (creatorSetters) {
              setters.push(...creatorSetters);
            }
          }
        }

        // Jotai: atom(...) - for future support
        // if (initText.includes('atom(')) {
        //   storeType = 'jotai';
        // }

        if (storeType && setters.length > 0) {
          stores.push({
            name,
            file: relativePath,
            line: decl.getStartLineNumber(),
            type: storeType,
            setters,
            readers: [], // Will be populated later
            writers: [], // Will be populated later
          });
        }
      }
    }
  }

  return stores;
}

/**
 * Find hooks that read from a Zustand store
 */
function findStoreConsumers(
  storeName: string,
  files: FileAnalysis[]
): string[] {
  const consumers: string[] = [];

  for (const file of files) {
    for (const func of file.functions) {
      if (!func.isHook) continue;

      // Check if this hook calls the store
      if (func.calledFunctions.includes(storeName)) {
        consumers.push(func.name);
      }
    }
  }

  return consumers;
}

/**
 * Find hooks that write to a store (call its setters)
 */
function findStoreWriters(
  store: Store,
  files: FileAnalysis[]
): string[] {
  const writers: string[] = [];

  for (const file of files) {
    for (const func of file.functions) {
      if (!func.isHook) continue;

      // Check if this hook calls the store (to get setters)
      if (func.calledFunctions.includes(store.name)) {
        // Check if it also uses destructured setters (heuristic)
        for (const setter of store.setters) {
          if (func.calledFunctions.includes(setter)) {
            writers.push(func.name);
            break;
          }
        }
      }
    }
  }

  return writers;
}

/**
 * Build store edges: reads and writes relationships between hooks and stores
 */
function buildStoreEdges(
  stores: Store[],
  files: FileAnalysis[]
): CanonicalEdge[] {
  const edges: CanonicalEdge[] = [];

  for (const store of stores) {
    // Find readers (hooks that read from store)
    const readers = findStoreConsumers(store.name, files);
    store.readers = readers;

    // Find writers (hooks that write to store)
    const writers = findStoreWriters(store, files);
    store.writers = writers;

    // Build read edges
    for (const reader of readers) {
      edges.push({
        from: ui.hook(reader),
        to: ui.store(store.name),
        type: 'reads',
      });
    }

    // Build write edges
    for (const writer of writers) {
      edges.push({
        from: ui.hook(writer),
        to: ui.store(store.name),
        type: 'writes',
      });
    }
  }

  return edges;
}

/**
 * Build runtime call edges: queries and calls relationships between hooks and runtime
 */
function buildRuntimeEdges(hooks: HookTrace[]): CanonicalEdge[] {
  const edges: CanonicalEdge[] = [];
  const seen = new Set<string>();

  for (const hook of hooks) {
    const hookId = ui.hook(hook.name);

    // Collect all runtime calls (direct + imported)
    const allCalls = [
      ...hook.runtimeCalls,
      ...hook.importedCalls.flatMap(ic => ic.calls),
    ];

    for (const call of allCalls) {
      // Determine edge type and target based on call type
      let targetId: string;
      let edgeType: EdgeType;

      if (call.type === 'query') {
        targetId = runtime.storage(call.pallet, call.item);
        edgeType = 'queries';
      } else if (call.type === 'tx') {
        targetId = runtime.call(call.pallet, call.item);
        edgeType = 'calls';
      } else if (call.type === 'const') {
        targetId = runtime.const(call.pallet, call.item);
        edgeType = 'queries';
      } else {
        // sdk/api types - link to pallet level with 'uses'
        targetId = runtime.pallet(call.pallet);
        edgeType = 'uses';
      }

      // Deduplicate edges
      const edgeKey = `${hookId}|${targetId}|${edgeType}`;
      if (!seen.has(edgeKey)) {
        seen.add(edgeKey);
        edges.push({
          from: hookId,
          to: targetId,
          type: edgeType,
        });
      }
    }
  }

  return edges;
}

/**
 * Enrich hook traces with store-propagated runtime calls.
 * When a hook reads from a store, it inherits runtime calls from hooks that write to that store.
 */
function enrichHooksWithStoreCalls(
  hooks: HookTrace[],
  storeEdges: CanonicalEdge[],
  stores: Store[]
): void {
  // Build hook trace map for quick lookup
  const hookTraceMap = new Map<string, HookTrace>();
  for (const hook of hooks) {
    hookTraceMap.set(hook.name, hook);
  }

  // Group edges by store
  const readersByStore = new Map<string, string[]>();
  const writersByStore = new Map<string, string[]>();

  for (const edge of storeEdges) {
    const storeName = edge.to.replace('ui:store:', '');
    const hookName = edge.from.replace('ui:hook:', '');

    if (edge.type === 'reads') {
      if (!readersByStore.has(storeName)) readersByStore.set(storeName, []);
      readersByStore.get(storeName)!.push(hookName);
    } else {
      if (!writersByStore.has(storeName)) writersByStore.set(storeName, []);
      writersByStore.get(storeName)!.push(hookName);
    }
  }

  // For each store, propagate runtime calls from writers to readers
  for (const store of stores) {
    const readers = readersByStore.get(store.name) || [];
    const writers = writersByStore.get(store.name) || [];

    for (const readerName of readers) {
      const readerTrace = hookTraceMap.get(readerName);
      if (!readerTrace) continue;

      for (const writerName of writers) {
        if (readerName === writerName) continue; // Skip self-references

        const writerTrace = hookTraceMap.get(writerName);
        if (!writerTrace) continue;

        // Get all runtime calls from the writer
        const writerCalls = [
          ...writerTrace.runtimeCalls,
          ...writerTrace.importedCalls.flatMap(ic => ic.calls),
        ];

        if (writerCalls.length > 0) {
          // Add store-propagated calls as imported calls
          readerTrace.importedCalls.push({
            through: `${store.name} → ${writerName}`,
            fromFile: 'store-chain',
            calls: writerCalls,
          });
        }
      }
    }
  }
}

export async function extractStaticAnalysis(options: ExtractOptions): Promise<StaticAnalysisResult> {
  const { repoPath, outputPath, patterns = ['apps/main/src/**/*.ts', 'apps/main/src/**/*.tsx'], layer } = options;

  log.section('Static Analysis Extraction');
  log.info(`Source: ${repoPath}`);
  log.info(`Output: ${outputPath}`);
  log.info(`Layer: ${layer || 'unknown'}`);

  // Find tsconfig - check common locations
  const tsconfigPaths = [
    join(repoPath, 'tsconfig.json'),
    join(repoPath, 'apps/main/tsconfig.json'),
    join(repoPath, 'packages/sdk-next/tsconfig.json'),
  ];

  let tsConfigFilePath: string | undefined;
  for (const p of tsconfigPaths) {
    try {
      const fs = await import('fs');
      if (fs.existsSync(p)) {
        tsConfigFilePath = p;
        break;
      }
    } catch {
      // continue
    }
  }

  // Create TypeScript project - works without tsconfig too
  const project = new Project({
    tsConfigFilePath,
    skipAddingFilesFromTsConfig: true,
    compilerOptions: tsConfigFilePath ? undefined : {
      target: 99, // ESNext
      module: 99, // ESNext
      moduleResolution: 2, // Node
      esModuleInterop: true,
      strict: true,
      jsx: 4, // ReactJSX
    },
  });

  // Add source files
  log.step('Loading source files...');
  for (const pattern of patterns) {
    project.addSourceFilesAtPaths(join(repoPath, pattern));
  }

  const sourceFiles = project.getSourceFiles();
  log.success(`Loaded ${sourceFiles.length} source files`);

  // Analyze each file
  log.step('Analyzing files...');
  const files: FileAnalysis[] = [];
  for (const sourceFile of sourceFiles) {
    try {
      const analysis = analyzeFile(sourceFile, repoPath);
      files.push(analysis);
    } catch (err) {
      log.warn(`Failed to analyze ${sourceFile.getFilePath()}: ${err}`);
    }
  }

  log.success(`Analyzed ${files.length} files`);

  // Build export map for cross-file resolution
  const exportMap = buildExportMap(files);
  const fileSet = new Set(files.map(f => f.file));

  // Find and trace all hooks
  log.step('Tracing hooks...');
  const hooks: HookTrace[] = [];
  let totalRuntimeCalls = 0;

  for (const file of files) {
    for (const func of file.functions) {
      if (func.isHook && func.isExported) {
        const trace = traceHookCalls(func, exportMap, fileSet, repoPath);
        hooks.push(trace);

        const callCount = trace.runtimeCalls.length +
          trace.importedCalls.reduce((sum, ic) => sum + ic.calls.length, 0);
        totalRuntimeCalls += callCount;
      }
    }
  }

  log.success(`Traced ${hooks.length} hooks with ${totalRuntimeCalls} runtime calls`);

  // Detect stores (UI layer only)
  log.step('Detecting stores...');
  const stores = layer === 'ui' ? detectStores(files, project, repoPath) : [];
  log.success(`Found ${stores.length} stores`);

  // Build store edges and enrich hooks
  let storeEdges: CanonicalEdge[] = [];
  if (stores.length > 0) {
    log.step('Building store edges...');
    storeEdges = buildStoreEdges(stores, files);
    log.success(`Built ${storeEdges.length} store edges (reads/writes)`);

    // Enrich hooks with store-propagated calls
    enrichHooksWithStoreCalls(hooks, storeEdges, stores);

    // Recalculate runtime calls after enrichment
    totalRuntimeCalls = 0;
    for (const hook of hooks) {
      totalRuntimeCalls += hook.runtimeCalls.length +
        hook.importedCalls.reduce((sum, ic) => sum + ic.calls.length, 0);
    }
    log.success(`Total runtime calls after store enrichment: ${totalRuntimeCalls}`);
  }

  // Build runtime edges (queries/calls from hooks to runtime)
  log.step('Building runtime edges...');
  const runtimeEdges = buildRuntimeEdges(hooks);
  log.success(`Built ${runtimeEdges.length} runtime edges (queries/calls)`);

  // Combine all edges into unified array
  const edges: CanonicalEdge[] = [...storeEdges, ...runtimeEdges];
  log.success(`Total edges: ${edges.length}`);

  // Build call graph (for debugging/visualization, not canonical)
  log.step('Building call graph...');
  const callGraph = buildCallGraph(files, exportMap);
  log.success(`Built call graph with ${callGraph.length} edges`);

  const result: StaticAnalysisResult = {
    meta: {
      extractedAt: new Date().toISOString(),
      filesAnalyzed: files.length,
      hooksFound: hooks.length,
      runtimeCallsFound: totalRuntimeCalls,
      storesFound: stores.length,
      edgesFound: edges.length,
    },
    files,
    hooks,
    callGraph,
    stores,
    edges,
  };

  // Write output
  writeJSON(join(outputPath, 'static-analysis.json'), result);
  log.success(`Output written to ${outputPath}/static-analysis.json`);

  // Generate summary
  const summary = generateSummary(result);
  writeFile(join(outputPath, 'static-analysis-summary.md'), summary);
  log.success(`Summary written to ${outputPath}/static-analysis-summary.md`);

  log.section('Static Analysis Complete');
  console.log(`
  Files analyzed:      ${result.meta.filesAnalyzed}
  Hooks found:         ${result.meta.hooksFound}
  Runtime calls found: ${result.meta.runtimeCallsFound}
  Stores found:        ${result.meta.storesFound}
  Canonical edges:     ${edges.length}
  Call graph edges:    ${callGraph.length}
  `);

  return result;
}

function generateSummary(result: StaticAnalysisResult): string {
  const { meta, hooks } = result;

  // Group runtime calls by pallet
  const palletCalls = new Map<string, { queries: string[]; txs: string[] }>();

  for (const hook of hooks) {
    const allCalls = [
      ...hook.runtimeCalls,
      ...hook.importedCalls.flatMap(ic => ic.calls),
    ];

    for (const call of allCalls) {
      if (!palletCalls.has(call.pallet)) {
        palletCalls.set(call.pallet, { queries: [], txs: [] });
      }
      const entry = palletCalls.get(call.pallet)!;
      const item = `${call.item} (${hook.name})`;
      if (call.type === 'query') {
        if (!entry.queries.includes(item)) entry.queries.push(item);
      } else {
        if (!entry.txs.includes(item)) entry.txs.push(item);
      }
    }
  }

  // Hooks with most runtime calls
  const hooksByCallCount = hooks
    .map(h => ({
      name: h.name,
      count: h.runtimeCalls.length + h.importedCalls.reduce((s, ic) => s + ic.calls.length, 0),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Group edges by type
  const edgesByType = new Map<string, number>();
  for (const edge of result.edges) {
    edgesByType.set(edge.type, (edgesByType.get(edge.type) || 0) + 1);
  }

  // Store summary
  const storeSummary = result.stores.length > 0
    ? `

## Stores

| Store | Type | Readers | Writers |
|-------|------|---------|---------|
${result.stores.slice(0, 20).map(s =>
  `| ${s.name} | ${s.type} | ${s.readers.length} | ${s.writers.length} |`
).join('\n')}
`
    : '';

  // Edge summary - show sample edges grouped by type
  const storeEdges = result.edges.filter(e => e.type === 'reads' || e.type === 'writes');
  const runtimeEdges = result.edges.filter(e => e.type === 'queries' || e.type === 'calls' || e.type === 'uses');

  return `# Static Analysis Summary

Generated: ${meta.extractedAt}

## Statistics

| Metric | Count |
|--------|-------|
| Files analyzed | ${meta.filesAnalyzed} |
| Hooks found | ${meta.hooksFound} |
| Runtime calls traced | ${meta.runtimeCallsFound} |
| Stores found | ${meta.storesFound} |
| Canonical edges | ${meta.edgesFound} |

### Edges by Type

| Type | Count | Description |
|------|-------|-------------|
| queries | ${edgesByType.get('queries') || 0} | Hook → Runtime storage |
| calls | ${edgesByType.get('calls') || 0} | Hook → Runtime extrinsic |
| reads | ${edgesByType.get('reads') || 0} | Hook → Store (read) |
| writes | ${edgesByType.get('writes') || 0} | Hook → Store (write) |
| uses | ${edgesByType.get('uses') || 0} | Hook → Pallet (SDK call) |
${storeSummary}
## Sample Edges

### Store Edges (${storeEdges.length})

| From | Type | To |
|------|------|-----|
${storeEdges.slice(0, 15).map(e =>
  `| ${e.from.replace('ui:hook:', '')} | ${e.type} | ${e.to.replace('ui:store:', '')} |`
).join('\n')}

### Runtime Edges (${runtimeEdges.length})

| From | Type | To |
|------|------|-----|
${runtimeEdges.slice(0, 15).map(e =>
  `| ${e.from.replace('ui:hook:', '')} | ${e.type} | ${e.to} |`
).join('\n')}

## Pallets Used by UI

${[...palletCalls.entries()]
  .sort((a, b) => (b[1].queries.length + b[1].txs.length) - (a[1].queries.length + a[1].txs.length))
  .map(([pallet, calls]) => `### ${pallet}

**Queries (${calls.queries.length}):** ${calls.queries.slice(0, 10).join(', ')}${calls.queries.length > 10 ? '...' : ''}

**Transactions (${calls.txs.length}):** ${calls.txs.slice(0, 10).join(', ')}${calls.txs.length > 10 ? '...' : ''}
`).join('\n')}

## Top Hooks by Runtime Calls

| Hook | Calls |
|------|-------|
${hooksByCallCount.map(h => `| ${h.name} | ${h.count} |`).join('\n')}
`;
}

/**
 * Extract static analysis for SDK
 */
export async function extractSDKAnalysis(options: ExtractOptions): Promise<StaticAnalysisResult> {
  const defaultPatterns = [
    'packages/sdk-next/src/**/*.ts',
    'packages/common/src/**/*.ts',
  ];

  return extractStaticAnalysis({
    ...options,
    patterns: options.patterns || defaultPatterns,
    layer: 'sdk',
  });
}

/**
 * Extract static analysis for UI
 */
export async function extractUIAnalysis(options: ExtractOptions): Promise<StaticAnalysisResult> {
  const defaultPatterns = [
    'apps/main/src/**/*.ts',
    'apps/main/src/**/*.tsx',
  ];

  return extractStaticAnalysis({
    ...options,
    patterns: options.patterns || defaultPatterns,
    layer: 'ui',
  });
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const layer = process.env.LAYER || 'ui';
  const repoPath = process.env.REPO_PATH || (layer === 'sdk' ? './repos/sdk' : './repos/hydration-ui');
  const outputPath = process.env.OUTPUT_PATH || `./extractions/${layer}`;

  const extract = layer === 'sdk' ? extractSDKAnalysis : extractUIAnalysis;

  extract({ repoPath, outputPath }).catch((err) => {
    console.error('Static analysis failed:', err);
    process.exit(1);
  });
}
