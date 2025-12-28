/**
 * Indexer Layer Extraction (L3)
 *
 * Extracts data from hydration-data-lake (Squid indexer):
 * - GraphQL entities from schema.graphql
 * - Event handlers that process runtime events
 * - Runtime events the indexer subscribes to
 *
 * Handler Extraction via Static Analysis:
 * Uses ts-morph to trace the flow from event subscription to handler function:
 * 1. Find getSectionByEventName() calls that match runtime events
 * 2. Trace the for-loop that iterates over the section
 * 3. Find the await handler() call inside the loop
 * 4. Resolve the handler function name and source location
 *
 * This provides accurate handler names and line numbers for GitHub links,
 * rather than fabricating names from event patterns.
 */

import { join, relative, dirname } from 'path';
import { existsSync } from 'fs';
import { Project, SourceFile, Node, CallExpression, SyntaxKind } from 'ts-morph';
import { createLogger } from '../utils/logger.js';
import { readFile, writeJSON, writeFile, grepFiles } from '../utils/files.js';
import { getGitInfo } from '../utils/git.js';
import type { IndexerExtraction, GraphQLEntity, EventHandler } from '../schemas/extraction.js';

const log = createLogger('L3:indexer');

/**
 * Parse appConfig.ts to extract the list of runtime events the indexer listens to.
 * These are the actual Substrate events like "Omnipool.TokenAdded", "XYK.BuyExecuted".
 */
function extractRuntimeEvents(repoPath: string): string[] {
  const runtimeEvents: string[] = [];
  const seenEvents = new Set<string>();

  // Check both indexer variants
  const configPaths = [
    join(repoPath, 'indexers/liquidity-pools/src/appConfig.ts'),
    join(repoPath, 'indexers/storage-dictionary/src/appConfig.ts'),
  ];

  for (const configPath of configPaths) {
    const content = readFile(configPath);
    if (!content) continue;

    // Pattern: events.<pallet>.<event>.name
    // Examples:
    //   events.assetRegistry.locationSet.name → AssetRegistry.LocationSet
    //   events.omnipool.tokenAdded.name → Omnipool.TokenAdded
    const eventPattern = /events\.(\w+)\.(\w+)\.name/g;
    let match;
    while ((match = eventPattern.exec(content)) !== null) {
      const pallet = match[1];
      const event = match[2];

      // Convert camelCase to PascalCase for event name
      const palletPascal = pallet.charAt(0).toUpperCase() + pallet.slice(1);
      const eventPascal = event.charAt(0).toUpperCase() + event.slice(1);
      const fullEvent = `${palletPascal}.${eventPascal}`;

      if (!seenEvents.has(fullEvent)) {
        seenEvents.add(fullEvent);
        runtimeEvents.push(fullEvent);
      }
    }
  }

  return runtimeEvents.sort();
}

/**
 * Build a mapping from runtime events to the handlers that process them.
 * This traces the data flow: Runtime Event → Handler → Entity
 */
function buildEventToHandlerMap(
  handlers: EventHandler[],
  runtimeEvents: string[]
): Record<string, { handlers: string[]; entities: string[] }> {
  const eventMap: Record<string, { handlers: string[]; entities: string[] }> = {};

  // Initialize with all runtime events
  for (const event of runtimeEvents) {
    eventMap[event] = { handlers: [], entities: [] };
  }

  // Map handlers to events based on event name matching
  for (const handler of handlers) {
    const handlerEvent = handler.event;

    // Direct match
    if (eventMap[handlerEvent]) {
      eventMap[handlerEvent].handlers.push(handler.handler);
      eventMap[handlerEvent].entities.push(...handler.createsEntities);
    }

    // Try fuzzy match (handler event might be slightly different format)
    for (const runtimeEvent of runtimeEvents) {
      const [rPallet, rEvent] = runtimeEvent.split('.');
      const [hPallet, hEvent] = handlerEvent.split('.');

      if (
        rPallet?.toLowerCase() === hPallet?.toLowerCase() &&
        rEvent?.toLowerCase() === hEvent?.toLowerCase()
      ) {
        if (!eventMap[runtimeEvent].handlers.includes(handler.handler)) {
          eventMap[runtimeEvent].handlers.push(handler.handler);
        }
        for (const entity of handler.createsEntities) {
          if (!eventMap[runtimeEvent].entities.includes(entity)) {
            eventMap[runtimeEvent].entities.push(entity);
          }
        }
      }
    }
  }

  return eventMap;
}

interface ExtractOptions {
  repoPath: string;
  outputPath: string;
}

function parseGraphQLSchema(schemaPath: string): GraphQLEntity[] {
  const content = readFile(schemaPath);
  if (!content) return [];

  const entities: GraphQLEntity[] = [];
  const typeRegex = /type\s+(\w+)\s*(?:@entity)?\s*\{([^}]+)\}/g;

  let match;
  while ((match = typeRegex.exec(content)) !== null) {
    const name = match[1];
    const fieldsBlock = match[2];

    const fields: Array<{ name: string; type: string; nullable: boolean }> = [];
    const fieldRegex = /(\w+)\s*:\s*([^\n,!]+)(!)?/g;

    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(fieldsBlock)) !== null) {
      fields.push({
        name: fieldMatch[1],
        type: fieldMatch[2].trim(),
        nullable: !fieldMatch[3],
      });
    }

    entities.push({ name, fields });
  }

  return entities;
}

/**
 * Use static analysis to extract event handlers from the indexer.
 * Traces: EventName.Pallet_Event → getSectionByEventName → for loop → await handler()
 */
function extractHandlersWithStaticAnalysis(repoPath: string): EventHandler[] {
  const handlers: EventHandler[] = [];
  const handlersDir = join(repoPath, 'indexers/liquidity-pools/src/handlers');

  if (!existsSync(handlersDir)) {
    log.warn('handlers/ directory not found');
    return handlers;
  }

  // Create ts-morph project
  const project = new Project({
    tsConfigFilePath: join(repoPath, 'indexers/liquidity-pools/tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });

  // Add all handler files
  project.addSourceFilesAtPaths(join(handlersDir, '**/*.ts'));

  // Also add model files for entity tracking
  const modelDir = join(repoPath, 'indexers/liquidity-pools/src/model');
  if (existsSync(modelDir)) {
    project.addSourceFilesAtPaths(join(modelDir, '**/*.ts'));
  }

  // Build import resolution map
  const importMap = new Map<string, { file: string; line: number }>();

  // First pass: build a map of all exported functions and their locations
  for (const sourceFile of project.getSourceFiles()) {
    const filePath = relative(repoPath, sourceFile.getFilePath());
    if (!filePath.includes('handlers/')) continue;

    // Find all exported function declarations
    for (const func of sourceFile.getFunctions()) {
      if (func.isExported()) {
        const name = func.getName();
        if (name) {
          importMap.set(`${filePath}:${name}`, {
            file: filePath,
            line: func.getStartLineNumber(),
          });
        }
      }
    }

    // Also check variable declarations with arrow functions
    for (const varDecl of sourceFile.getVariableDeclarations()) {
      const init = varDecl.getInitializer();
      if (init && Node.isArrowFunction(init)) {
        const stmt = varDecl.getVariableStatement();
        if (stmt?.isExported()) {
          const name = varDecl.getName();
          importMap.set(`${filePath}:${name}`, {
            file: filePath,
            line: varDecl.getStartLineNumber(),
          });
        }
      }
    }
  }

  // Second pass: find event handler patterns
  const seenEvents = new Set<string>();
  const fileToEntities = new Map<string, string[]>();

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = relative(repoPath, sourceFile.getFilePath());
    if (!filePath.includes('handlers/')) continue;

    // Track model imports for entity detection
    for (const importDecl of sourceFile.getImportDeclarations()) {
      const moduleSpec = importDecl.getModuleSpecifierValue();
      if (moduleSpec.includes('model')) {
        const entities = importDecl.getNamedImports()
          .map(ni => ni.getName())
          .filter(name => /^[A-Z]/.test(name) && !name.includes('Type') && !name.includes('Enum'));
        if (entities.length > 0) {
          const existing = fileToEntities.get(filePath) || [];
          fileToEntities.set(filePath, [...new Set([...existing, ...entities])]);
        }
      }
    }

    // Build local import map (function name -> source file)
    const localImports = new Map<string, string>();
    for (const importDecl of sourceFile.getImportDeclarations()) {
      const moduleSpec = importDecl.getModuleSpecifierValue();
      for (const namedImport of importDecl.getNamedImports()) {
        const name = namedImport.getName();
        // Resolve relative import
        if (moduleSpec.startsWith('.')) {
          const resolvedPath = resolveImportPath(filePath, moduleSpec);
          localImports.set(name, resolvedPath);
        }
      }
    }

    // Find getSectionByEventName calls
    sourceFile.forEachDescendant((node) => {
      if (Node.isCallExpression(node)) {
        const expr = node.getExpression();
        if (Node.isPropertyAccessExpression(expr)) {
          if (expr.getName() === 'getSectionByEventName') {
            const args = node.getArguments();
            if (args.length > 0) {
              const arg = args[0];
              if (Node.isPropertyAccessExpression(arg)) {
                const eventText = arg.getText(); // EventName.Pallet_Event
                const match = eventText.match(/EventName\.(\w+)_(\w+)/);
                if (match) {
                  const pallet = match[1];
                  const event = match[2];
                  const key = `${pallet}.${event}`;

                  // Only mark as seen if we find a handler
                  // (some files reference events without handling them)
                  if (!seenEvents.has(key)) {
                    // Find the for loop and await call
                    const handlerInfo = findHandlerInForLoop(node, localImports, filePath, repoPath);

                    if (handlerInfo) {
                      seenEvents.add(key);  // Only add after finding handler
                      const entities = fileToEntities.get(handlerInfo.file) || fileToEntities.get(filePath) || [];
                      handlers.push({
                        event: key,
                        handler: handlerInfo.name,
                        file: handlerInfo.file,
                        line: handlerInfo.line,
                        createsEntities: entities,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  return handlers;
}

/**
 * Resolve a relative import path to a file path
 */
function resolveImportPath(fromFile: string, importPath: string): string {
  const dir = dirname(fromFile);
  let resolved = join(dir, importPath);
  if (!resolved.endsWith('.ts')) {
    resolved += '.ts';
  }
  // Handle index.ts
  if (resolved.endsWith('/index.ts')) {
    return resolved;
  }
  return resolved;
}

/**
 * Find the handler function called within a for loop that iterates over event data.
 * Handles two patterns:
 * 1. Direct: for (...getSectionByEventName()...) { await handler() }
 * 2. Variable: const list = [...getSectionByEventName()]; for (... of list) { await handler() }
 */
function findHandlerInForLoop(
  getSectionCall: CallExpression,
  localImports: Map<string, string>,
  currentFile: string,
  repoPath: string
): { name: string; file: string; line: number } | null {
  // Walk up to find the for-of statement or variable declaration
  let current: Node | undefined = getSectionCall;
  let forStatement: Node | undefined;
  let variableName: string | undefined;

  while (current) {
    if (Node.isForOfStatement(current) || Node.isForStatement(current)) {
      forStatement = current;
      break;
    }
    // Check if the getSectionByEventName is in a variable declaration
    if (Node.isVariableDeclaration(current)) {
      variableName = current.getName();
    }
    current = current.getParent();
  }

  // If no direct for loop found but we have a variable name,
  // search the containing function for a for loop that uses this variable
  if (!forStatement && variableName) {
    // Find the containing function
    let containingFunc: Node | undefined = getSectionCall;
    while (containingFunc && !Node.isFunctionDeclaration(containingFunc) && !Node.isArrowFunction(containingFunc)) {
      containingFunc = containingFunc.getParent();
    }

    if (containingFunc) {
      // Look for for loops that reference the variable
      containingFunc.forEachDescendant((node) => {
        if (Node.isForOfStatement(node) && !forStatement) {
          const iterExpr = node.getExpression().getText();
          // Check if the for loop iterates over our variable or a transformation of it
          if (iterExpr.includes(variableName!)) {
            forStatement = node;
          }
        }
      });
    }
  }

  if (!forStatement) {
    // Try looking at siblings/ancestors for the for loop containing this call
    const parent = getSectionCall.getParent();
    if (parent) {
      const grandparent = parent.getParent();
      if (grandparent) {
        // The getSectionByEventName might be in an array that feeds a for loop
        let ancestor: Node | undefined = grandparent;
        while (ancestor) {
          if (Node.isForOfStatement(ancestor)) {
            forStatement = ancestor;
            break;
          }
          ancestor = ancestor.getParent();
        }
      }
    }
  }

  if (!forStatement) return null;

  // Find await calls within the for loop
  let foundName: string | null = null;
  let foundLine = 0;

  forStatement.forEachDescendant((node) => {
    if (Node.isAwaitExpression(node)) {
      const expr = node.getExpression();
      if (Node.isCallExpression(expr)) {
        const callee = expr.getExpression();
        if (Node.isIdentifier(callee)) {
          const name = callee.getText();
          // Skip common utility functions
          if (!['getOrderedListByBlockNumber', 'Promise', 'map', 'filter'].includes(name)) {
            foundName = name;
            foundLine = node.getStartLineNumber();
          }
        }
      }
    }
  });

  if (!foundName) return null;

  // Try to find where this handler is defined
  const importSource = localImports.get(foundName);
  if (importSource) {
    // Find the actual definition in the imported file
    const fullPath = join(repoPath, importSource);
    const content = readFile(fullPath);
    if (content) {
      // Look for function definition
      const funcPattern = new RegExp(`(export\\s+)?(async\\s+)?function\\s+${foundName}\\s*\\(`, 'm');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (funcPattern.test(lines[i])) {
          return {
            name: foundName,
            file: importSource,
            line: i + 1,
          };
        }
      }
    }
  }

  // Return with current file if can't resolve import
  return {
    name: foundName,
    file: currentFile,
    line: foundLine,
  };
}


function generateIndexerContextDoc(result: IndexerExtraction): string {
  const { meta, schema, handlers, endpoints, statistics, runtimeEvents, eventToHandlerMap } = result;

  // Group entities by domain (based on name prefix patterns)
  const entityGroups = new Map<string, typeof schema.entities>();
  for (const entity of schema.entities) {
    let domain = 'Other';
    if (entity.name.includes('Pool') || entity.name.includes('Omnipool') || entity.name.includes('Stableswap') || entity.name.includes('Xyk') || entity.name.includes('Lbp')) {
      domain = 'Pools';
    } else if (entity.name.includes('Asset') || entity.name.includes('Token')) {
      domain = 'Assets';
    } else if (entity.name.includes('Account') || entity.name.includes('Balance')) {
      domain = 'Accounts';
    } else if (entity.name.includes('Trade') || entity.name.includes('Swap') || entity.name.includes('Volume')) {
      domain = 'Trading';
    } else if (entity.name.includes('Farm') || entity.name.includes('LM') || entity.name.includes('Liquidity')) {
      domain = 'Liquidity Mining';
    } else if (entity.name.includes('Dca') || entity.name.includes('Order')) {
      domain = 'DCA/Orders';
    } else if (entity.name.includes('Hist') || entity.name.includes('Snapshot')) {
      domain = 'Historical Data';
    }
    if (!entityGroups.has(domain)) entityGroups.set(domain, []);
    entityGroups.get(domain)!.push(entity);
  }

  // Group handlers by pallet
  const handlersByPallet = new Map<string, typeof handlers>();
  for (const h of handlers) {
    const pallet = h.event.includes('.') ? h.event.split('.')[0] : 'general';
    if (!handlersByPallet.has(pallet)) handlersByPallet.set(pallet, []);
    handlersByPallet.get(pallet)!.push(h);
  }

  // Group runtime events by pallet
  const eventsByPallet = new Map<string, string[]>();
  for (const event of runtimeEvents || []) {
    const [pallet] = event.split('.');
    if (!eventsByPallet.has(pallet)) eventsByPallet.set(pallet, []);
    eventsByPallet.get(pallet)!.push(event);
  }

  return `# L3: Indexer Context

> **Auto-generated** - Do not edit manually.
> Extracted: ${meta.extractedAt}
> Commit: \`${meta.source.commit.slice(0, 7)}\` (${meta.source.branch})

## Summary

| Metric | Count |
|--------|-------|
| Entities | ${statistics.entitiesCount} |
| Handlers | ${statistics.handlersCount} |
| Runtime Events Indexed | ${statistics.runtimeEventsCount || 0} |
| Events with Handlers | ${statistics.eventsWithHandlersCount || 0} |

## Endpoints

- **Production:** ${endpoints.production}
${endpoints.testnet ? `- **Testnet:** ${endpoints.testnet}` : ''}

## Runtime Events Indexed

These are the Substrate runtime events that this indexer listens to and processes.

${[...eventsByPallet.entries()].map(([pallet, events]) => `### ${pallet} (${events.length})

| Event | Handlers | Entities |
|-------|----------|----------|
${events.map(e => {
  const mapping = eventToHandlerMap?.[e] || { handlers: [], entities: [] };
  const eventName = e.split('.')[1];
  const handlersStr = mapping.handlers.length > 0
    ? mapping.handlers.map(h => `\`${h}\``).join(', ')
    : '-';
  // Link event to first entity page that handles it, entities link to GitHub
  const firstEntity = mapping.entities[0];
  const eventLink = firstEntity
    ? `[${eventName}](/reference/indexer/${firstEntity})`
    : eventName;
  const entitiesStr = mapping.entities.length > 0
    ? mapping.entities.map(ent => {
        const fileName = ent.charAt(0).toLowerCase() + ent.slice(1);
        return `[${ent}](https://github.com/galacticcouncil/hydration-data-lake/blob/develop/indexers/liquidity-pools/src/model/generated/${fileName}.model.ts)`;
      }).join(', ')
    : '-';
  return `| ${eventLink} | ${handlersStr} | ${entitiesStr} |`;
}).join('\n')}
`).join('\n')}

## Entities by Domain

${[...entityGroups.entries()].map(([domain, entities]) => `### ${domain} (${entities.length})

${entities.map(e => `- **${e.name}** (${e.fields.length} fields)`).join('\n')}
`).join('\n')}

## Event Handlers by Pallet

${[...handlersByPallet.entries()].map(([pallet, hs]) => `### ${pallet} (${hs.length})

${hs.map(h => `- \`${h.event}\` → ${h.handler}`).join('\n')}
`).join('\n')}

## Entity Details

<details>
<summary>Full entity field listings (click to expand)</summary>

${schema.entities.map(e => `### ${e.name}

| Field | Type |
|-------|------|
${e.fields.map(f => `| ${f.name} | ${f.type}${f.nullable ? '?' : ''} |`).join('\n')}
`).join('\n')}

</details>
`;
}

export async function extractIndexer(options: ExtractOptions): Promise<IndexerExtraction> {
  const { repoPath, outputPath } = options;

  log.section('Hydration Indexer (L3) Extraction');
  log.info(`Source: ${repoPath}`);
  log.info(`Output: ${outputPath}`);

  const gitInfo = getGitInfo(repoPath);
  log.step(`Commit: ${gitInfo.commit.slice(0, 7)} (${gitInfo.branch})`);

  // Parse GraphQL schema
  log.section('Parsing GraphQL Schema');
  const schemaPath = join(repoPath, 'indexers/liquidity-pools/schema.graphql');
  const entities = parseGraphQLSchema(schemaPath);
  log.success(`Found ${entities.length} entities`);

  // Extract handlers using static analysis
  log.section('Extracting Event Handlers');
  const handlers = extractHandlersWithStaticAnalysis(repoPath);
  log.success(`Found ${handlers.length} handlers`);

  // Extract runtime events from appConfig.ts
  log.section('Extracting Runtime Events');
  const runtimeEvents = extractRuntimeEvents(repoPath);
  log.success(`Found ${runtimeEvents.length} runtime events being indexed`);

  // Build event → handler → entity mapping
  const eventToHandlerMap = buildEventToHandlerMap(handlers, runtimeEvents);
  const eventsWithHandlers = Object.entries(eventToHandlerMap).filter(
    ([, v]) => v.handlers.length > 0
  ).length;
  log.info(`${eventsWithHandlers}/${runtimeEvents.length} events have mapped handlers`);

  const result: IndexerExtraction = {
    meta: {
      layer: 'L3',
      name: 'indexer',
      extractedAt: new Date().toISOString(),
      source: gitInfo,
    },
    schema: {
      entities,
      queries: entities.map(e => e.name.toLowerCase() + 's'), // Simplified
    },
    handlers,
    runtimeEvents,
    eventToHandlerMap,
    endpoints: {
      production: 'https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphiql',
      testnet: 'https://galacticcouncil.squids.live/hydration-paseo-pools:prod/api/graphiql',
    },
    statistics: {
      entitiesCount: entities.length,
      handlersCount: handlers.length,
      runtimeEventsCount: runtimeEvents.length,
      eventsWithHandlersCount: eventsWithHandlers,
    },
  };

  writeJSON(join(outputPath, 'extraction.json'), result);
  log.success(`Output written to ${outputPath}/extraction.json`);

  // Generate L3 context doc
  const contextDoc = generateIndexerContextDoc(result);
  const contextPath = join(process.cwd(), 'agents/contexts/L3-indexer.md');
  writeFile(contextPath, contextDoc);
  log.success('Updated agents/contexts/L3-indexer.md');

  log.section('Extraction Complete');
  console.log(`
  Entities: ${result.statistics.entitiesCount}
  Handlers: ${result.statistics.handlersCount}
  Runtime Events: ${result.statistics.runtimeEventsCount}
  Events with Handlers: ${result.statistics.eventsWithHandlersCount}
  `);

  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const repoPath = process.env.REPO_PATH || './repos/indexer';
  const outputPath = process.env.OUTPUT_PATH || './extractions/indexer';

  extractIndexer({ repoPath, outputPath }).catch((err) => {
    console.error('Extraction failed:', err);
    process.exit(1);
  });
}
