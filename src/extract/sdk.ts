/**
 * Enhanced SDK Extraction Module using TypeScript AST
 *
 * Uses ts-morph for proper type extraction and per-function pallet call tracking.
 * Only extracts exported (public) API.
 */

import { join, relative } from 'path';
import { existsSync, readdirSync } from 'fs';
import { Project, Node, SourceFile, Type, MethodDeclaration, FunctionDeclaration, ClassDeclaration } from 'ts-morph';
import { createLogger } from '../utils/logger.js';
import { readFile, writeJSON, writeFile } from '../utils/files.js';
import { getGitInfo } from '../utils/git.js';

const log = createLogger('L2:sdk-enhanced');

// Runtime call patterns
const RUNTIME_PATTERNS = {
  query: [
    /this\.api\.query\.(\w+)\.(\w+)/,
    /api\.query\.(\w+)\.(\w+)/,
  ],
  tx: [
    /this\.api\.tx\.(\w+)\.(\w+)/,
    /api\.tx\.(\w+)\.(\w+)/,
  ],
  consts: [
    /this\.api\.consts\.(\w+)\.(\w+)/,
    /this\.api\.constants\.(\w+)\.(\w+)/,
    /api\.consts\.(\w+)\.(\w+)/,
  ],
};

interface PalletCall {
  pallet: string;
  item: string;
  type: 'query' | 'tx' | 'consts';
  line: number;
}

interface ExtractedMethod {
  name: string;
  className?: string;
  file: string;
  line: number;
  description?: string;
  params: Array<{ name: string; type: string }>;
  returnType: string;
  isAsync: boolean;
  isExported: boolean;
  palletCalls: PalletCall[];
}

interface ExtractedType {
  name: string;
  kind: 'type' | 'interface' | 'enum' | 'class';
  file: string;
  line: number;
  exported: boolean;
}

interface ExtractedPackage {
  name: string;
  version: string;
  path: string;
  description?: string;
  readme?: string;
  methods: ExtractedMethod[];
  types: ExtractedType[];
  // Aggregated pallet calls for the package
  palletCalls: {
    query: Array<{ pallet: string; item: string; methods: string[] }>;
    tx: Array<{ pallet: string; item: string; methods: string[] }>;
    consts: Array<{ pallet: string; item: string; methods: string[] }>;
  };
}

interface EnhancedSDKExtraction {
  meta: {
    layer: 'L2';
    name: string;
    extractedAt: string;
    source: { commit: string; branch: string; repo: string };
  };
  packages: ExtractedPackage[];
  apiCalls: {
    tx: { call: string; file: string; line: number }[];
    query: { call: string; file: string; line: number }[];
  };
  statistics: {
    packagesCount: number;
    methodsCount: number;
    typesCount: number;
    exportedMethodsCount: number;
    queryCalls: number;
    txCalls: number;
    constsCalls: number;
  };
}

interface ExtractOptions {
  repoPath: string;
  outputPath: string;
}

/**
 * Extract pallet calls from a method body text
 */
function extractPalletCalls(bodyText: string, startLine: number): PalletCall[] {
  const calls: PalletCall[] = [];
  const lines = bodyText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = startLine + i;

    // Check query patterns
    for (const pattern of RUNTIME_PATTERNS.query) {
      const matches = line.matchAll(new RegExp(pattern, 'g'));
      for (const match of matches) {
        calls.push({ pallet: match[1], item: match[2], type: 'query', line: lineNum });
      }
    }

    // Check tx patterns
    for (const pattern of RUNTIME_PATTERNS.tx) {
      const matches = line.matchAll(new RegExp(pattern, 'g'));
      for (const match of matches) {
        calls.push({ pallet: match[1], item: match[2], type: 'tx', line: lineNum });
      }
    }

    // Check consts patterns
    for (const pattern of RUNTIME_PATTERNS.consts) {
      const matches = line.matchAll(new RegExp(pattern, 'g'));
      for (const match of matches) {
        calls.push({ pallet: match[1], item: match[2], type: 'consts', line: lineNum });
      }
    }
  }

  return calls;
}

/**
 * Get a readable type string from ts-morph Type
 */
function getTypeString(type: Type): string {
  try {
    const text = type.getText();
    // Clean up complex types for readability
    if (text.length > 100) {
      // Simplify very long types
      if (text.includes('Promise<')) {
        const inner = text.match(/Promise<(.+)>$/);
        if (inner) return `Promise<...>`;
      }
      return text.substring(0, 80) + '...';
    }
    return text;
  } catch {
    return 'unknown';
  }
}

/**
 * Extract JSDoc description from a node
 */
function extractJSDoc(node: Node): string | undefined {
  const jsDocs = (node as any).getJsDocs?.();
  if (!jsDocs || jsDocs.length === 0) return undefined;

  const description = jsDocs[0].getDescription?.()?.trim();
  return description || undefined;
}

/**
 * Analyze a class and extract its public methods
 */
function analyzeClass(
  classDecl: ClassDeclaration,
  sourceFile: SourceFile,
  repoPath: string
): ExtractedMethod[] {
  const methods: ExtractedMethod[] = [];
  const relativePath = relative(repoPath, sourceFile.getFilePath());
  const className = classDecl.getName() || 'Anonymous';
  const isClassExported = classDecl.isExported();

  for (const method of classDecl.getMethods()) {
    // Skip private/protected methods
    if (method.hasModifier('private' as any) || method.hasModifier('protected' as any)) {
      continue;
    }
    // Skip methods starting with underscore
    const methodName = method.getName();
    if (methodName.startsWith('_')) continue;

    const bodyText = method.getBody()?.getText() || '';
    const palletCalls = extractPalletCalls(bodyText, method.getStartLineNumber());

    // Get parameter info
    const params = method.getParameters().map(p => ({
      name: p.getName(),
      type: getTypeString(p.getType()),
    }));

    // Get return type
    const returnType = getTypeString(method.getReturnType());

    methods.push({
      name: methodName,
      className,
      file: relativePath,
      line: method.getStartLineNumber(),
      description: extractJSDoc(method),
      params,
      returnType,
      isAsync: method.isAsync(),
      isExported: isClassExported, // Method is exported if class is exported
      palletCalls,
    });
  }

  return methods;
}

/**
 * Analyze a standalone function
 */
function analyzeFunction(
  func: FunctionDeclaration,
  sourceFile: SourceFile,
  repoPath: string
): ExtractedMethod | null {
  const name = func.getName();
  if (!name) return null;

  // Skip non-exported functions
  if (!func.isExported()) return null;

  const relativePath = relative(repoPath, sourceFile.getFilePath());
  const bodyText = func.getBody()?.getText() || '';
  const palletCalls = extractPalletCalls(bodyText, func.getStartLineNumber());

  const params = func.getParameters().map(p => ({
    name: p.getName(),
    type: getTypeString(p.getType()),
  }));

  const returnType = getTypeString(func.getReturnType());

  return {
    name,
    file: relativePath,
    line: func.getStartLineNumber(),
    description: extractJSDoc(func),
    params,
    returnType,
    isAsync: func.isAsync(),
    isExported: true,
    palletCalls,
  };
}

/**
 * Analyze arrow functions in variable declarations
 */
function analyzeArrowFunction(
  sourceFile: SourceFile,
  repoPath: string
): ExtractedMethod[] {
  const methods: ExtractedMethod[] = [];
  const relativePath = relative(repoPath, sourceFile.getFilePath());

  for (const varStmt of sourceFile.getVariableStatements()) {
    if (!varStmt.isExported()) continue;

    for (const decl of varStmt.getDeclarations()) {
      const init = decl.getInitializer();
      if (!init) continue;

      if (Node.isArrowFunction(init) || Node.isFunctionExpression(init)) {
        const name = decl.getName();
        const bodyText = init.getText();
        const palletCalls = extractPalletCalls(bodyText, decl.getStartLineNumber());

        const params = init.getParameters().map(p => ({
          name: p.getName(),
          type: getTypeString(p.getType()),
        }));

        const returnType = getTypeString(init.getReturnType());

        methods.push({
          name,
          file: relativePath,
          line: decl.getStartLineNumber(),
          description: extractJSDoc(varStmt),
          params,
          returnType,
          isAsync: init.isAsync?.() || false,
          isExported: true,
          palletCalls,
        });
      }
    }
  }

  return methods;
}

/**
 * Extract types from a source file
 */
function extractTypes(sourceFile: SourceFile, repoPath: string): ExtractedType[] {
  const types: ExtractedType[] = [];
  const relativePath = relative(repoPath, sourceFile.getFilePath());

  // Interfaces
  for (const iface of sourceFile.getInterfaces()) {
    if (iface.isExported()) {
      types.push({
        name: iface.getName(),
        kind: 'interface',
        file: relativePath,
        line: iface.getStartLineNumber(),
        exported: true,
      });
    }
  }

  // Type aliases
  for (const typeAlias of sourceFile.getTypeAliases()) {
    if (typeAlias.isExported()) {
      types.push({
        name: typeAlias.getName(),
        kind: 'type',
        file: relativePath,
        line: typeAlias.getStartLineNumber(),
        exported: true,
      });
    }
  }

  // Enums
  for (const enumDecl of sourceFile.getEnums()) {
    if (enumDecl.isExported()) {
      types.push({
        name: enumDecl.getName(),
        kind: 'enum',
        file: relativePath,
        line: enumDecl.getStartLineNumber(),
        exported: true,
      });
    }
  }

  // Classes (as types)
  for (const classDecl of sourceFile.getClasses()) {
    if (classDecl.isExported()) {
      const name = classDecl.getName();
      if (name) {
        types.push({
          name,
          kind: 'class',
          file: relativePath,
          line: classDecl.getStartLineNumber(),
          exported: true,
        });
      }
    }
  }

  return types;
}

/**
 * Aggregate pallet calls by storage/tx/const item
 */
function aggregatePalletCalls(methods: ExtractedMethod[]): ExtractedPackage['palletCalls'] {
  const queryMap = new Map<string, Set<string>>();
  const txMap = new Map<string, Set<string>>();
  const constsMap = new Map<string, Set<string>>();

  for (const method of methods) {
    const methodKey = method.className ? `${method.className}.${method.name}` : method.name;

    for (const call of method.palletCalls) {
      const key = `${call.pallet}.${call.item}`;

      if (call.type === 'query') {
        if (!queryMap.has(key)) queryMap.set(key, new Set());
        queryMap.get(key)!.add(methodKey);
      } else if (call.type === 'tx') {
        if (!txMap.has(key)) txMap.set(key, new Set());
        txMap.get(key)!.add(methodKey);
      } else if (call.type === 'consts') {
        if (!constsMap.has(key)) constsMap.set(key, new Set());
        constsMap.get(key)!.add(methodKey);
      }
    }
  }

  const toArray = (map: Map<string, Set<string>>) =>
    Array.from(map.entries()).map(([key, methods]) => {
      const [pallet, item] = key.split('.');
      return { pallet, item, methods: Array.from(methods) };
    });

  return {
    query: toArray(queryMap),
    tx: toArray(txMap),
    consts: toArray(constsMap),
  };
}

/**
 * Discover and analyze packages
 */
function discoverPackages(repoPath: string): Array<{ name: string; path: string; version: string; description?: string }> {
  const packagesDir = join(repoPath, 'packages');
  if (!existsSync(packagesDir)) {
    log.warn('packages/ directory not found');
    return [];
  }

  const packages: Array<{ name: string; path: string; version: string; description?: string }> = [];
  const entries = readdirSync(packagesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pkgPath = join(packagesDir, entry.name);
    const pkgJsonPath = join(pkgPath, 'package.json');

    if (!existsSync(pkgJsonPath)) continue;

    const pkgContent = readFile(pkgJsonPath);
    if (!pkgContent) continue;

    try {
      const pkg = JSON.parse(pkgContent);
      packages.push({
        name: pkg.name || entry.name,
        path: pkgPath,
        version: pkg.version || 'unknown',
        description: pkg.description,
      });
    } catch {
      log.warn(`Failed to parse ${pkgJsonPath}`);
    }
  }

  return packages;
}

/**
 * Extract README content
 */
function extractReadme(pkgPath: string): string | undefined {
  const readmePath = join(pkgPath, 'README.md');
  if (!existsSync(readmePath)) return undefined;
  return readFile(readmePath) || undefined;
}

export async function extractSDK(options: ExtractOptions): Promise<EnhancedSDKExtraction> {
  const { repoPath, outputPath } = options;

  log.section('SDK (L2) Extraction');
  log.info(`Source: ${repoPath}`);
  log.info(`Output: ${outputPath}`);

  const gitInfo = getGitInfo(repoPath);
  log.step(`Commit: ${gitInfo.commit.slice(0, 7)} (${gitInfo.branch})`);

  // Discover packages
  log.section('Discovering Packages');
  const pkgInfos = discoverPackages(repoPath);
  log.success(`Found ${pkgInfos.length} packages`);

  // Create ts-morph project
  log.section('Initializing TypeScript Analysis');
  const tsconfigPath = join(repoPath, 'tsconfig.json');
  const project = new Project({
    tsConfigFilePath: existsSync(tsconfigPath) ? tsconfigPath : undefined,
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      target: 99, // ESNext
      module: 99, // ESNext
      moduleResolution: 2, // Node
      esModuleInterop: true,
      strict: true,
    },
  });

  // Extract each package
  log.section('Extracting Packages');
  const packages: ExtractedPackage[] = [];
  let totalMethods = 0;
  let totalExportedMethods = 0;
  let totalTypes = 0;
  let totalQueryCalls = 0;
  let totalTxCalls = 0;
  let totalConstsCalls = 0;

  for (const info of pkgInfos) {
    log.step(`${info.name}@${info.version}`);

    const srcPath = join(info.path, 'src');
    if (!existsSync(srcPath)) {
      packages.push({
        name: info.name,
        version: info.version,
        path: info.path,
        description: info.description,
        methods: [],
        types: [],
        palletCalls: { query: [], tx: [], consts: [] },
      });
      continue;
    }

    // Add source files for this package
    project.addSourceFilesAtPaths(join(srcPath, '**/*.ts'));
    const sourceFiles = project.getSourceFiles().filter(sf =>
      sf.getFilePath().includes(info.path)
    );

    const methods: ExtractedMethod[] = [];
    const types: ExtractedType[] = [];

    for (const sourceFile of sourceFiles) {
      // Skip test files and .d.ts files
      const filePath = sourceFile.getFilePath();
      if (filePath.includes('.spec.') || filePath.includes('.test.') || filePath.endsWith('.d.ts')) {
        continue;
      }

      // Extract from classes
      for (const classDecl of sourceFile.getClasses()) {
        if (classDecl.isExported()) {
          methods.push(...analyzeClass(classDecl, sourceFile, repoPath));
        }
      }

      // Extract from standalone functions
      for (const func of sourceFile.getFunctions()) {
        const extracted = analyzeFunction(func, sourceFile, repoPath);
        if (extracted) methods.push(extracted);
      }

      // Extract from arrow functions
      methods.push(...analyzeArrowFunction(sourceFile, repoPath));

      // Extract types
      types.push(...extractTypes(sourceFile, repoPath));
    }

    // Clear project for next package
    project.removeSourceFile;

    const readme = extractReadme(info.path);
    const palletCalls = aggregatePalletCalls(methods);

    // Count calls
    const queryCalls = palletCalls.query.length;
    const txCalls = palletCalls.tx.length;
    const constsCalls = palletCalls.consts.length;

    packages.push({
      name: info.name,
      version: info.version,
      path: info.path,
      description: info.description,
      readme,
      methods,
      types,
      palletCalls,
    });

    totalMethods += methods.length;
    totalExportedMethods += methods.filter(m => m.isExported).length;
    totalTypes += types.length;
    totalQueryCalls += queryCalls;
    totalTxCalls += txCalls;
    totalConstsCalls += constsCalls;

    if (methods.length > 0 || queryCalls > 0) {
      log.info(`  → ${methods.length} methods, ${types.length} types, ${queryCalls} query, ${txCalls} tx, ${constsCalls} consts`);
    }
  }

  // Aggregate all API calls from all packages
  const allApiCalls: EnhancedSDKExtraction['apiCalls'] = { tx: [], query: [] };
  for (const pkg of packages) {
    // Aggregate tx calls
    for (const call of pkg.palletCalls.tx) {
      for (const method of call.methods) {
        allApiCalls.tx.push({
          call: `${call.pallet}.${call.item}`,
          file: method,
          line: 0,
        });
      }
    }
    // Aggregate query calls
    for (const call of pkg.palletCalls.query) {
      for (const method of call.methods) {
        allApiCalls.query.push({
          call: `${call.pallet}.${call.item}`,
          file: method,
          line: 0,
        });
      }
    }
  }

  const result: EnhancedSDKExtraction = {
    meta: {
      layer: 'L2',
      name: 'sdk',
      extractedAt: new Date().toISOString(),
      source: gitInfo,
    },
    packages,
    apiCalls: allApiCalls,
    statistics: {
      packagesCount: packages.length,
      methodsCount: totalMethods,
      typesCount: totalTypes,
      exportedMethodsCount: totalExportedMethods,
      queryCalls: totalQueryCalls,
      txCalls: totalTxCalls,
      constsCalls: totalConstsCalls,
    },
  };

  writeJSON(join(outputPath, 'extraction-enhanced.json'), result);
  log.success(`Output written to ${outputPath}/extraction-enhanced.json`);

  log.section('Extraction Complete');
  console.log(`
  Packages:        ${result.statistics.packagesCount}
  Methods:         ${result.statistics.methodsCount} (${result.statistics.exportedMethodsCount} exported)
  Types:           ${result.statistics.typesCount}
  Query Calls:     ${result.statistics.queryCalls}
  TX Calls:        ${result.statistics.txCalls}
  Const Calls:     ${result.statistics.constsCalls}
  `);

  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const repoPath = process.env.REPO_PATH || './repos/sdk';
  const outputPath = process.env.OUTPUT_PATH || './extractions/sdk';

  extractSDK({ repoPath, outputPath }).catch((err) => {
    console.error('Extraction failed:', err);
    process.exit(1);
  });
}
