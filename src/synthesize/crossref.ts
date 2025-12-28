/**
 * Cross-Reference Index Generator (v2 - Canonical IDs)
 *
 * Builds a unified index of all entities across layers using canonical IDs.
 * See: proposals/canonical-ids.md for design documentation.
 * See: src/schemas/canonical-ids.ts for ID utilities.
 *
 * This index is used by:
 * - Other synthesizers for generating cross-references in docs
 * - AI agents for understanding codebase relationships
 * - Search and navigation features
 */

import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'fs';
import { createLogger } from '../utils/logger.js';
import { readJSON } from '../utils/files.js';
import {
  type Layer,
  type EdgeType,
  type CanonicalEntry,
  type CanonicalEdge,
  type CanonicalIndex,
  runtime,
  sdk,
  indexer,
  ui,
  parseCanonicalId,
} from '../schemas/canonical-ids.js';

const log = createLogger('crossref');

// =============================================================================
// EXTRACTION SCHEMAS (input from extractors)
// =============================================================================

interface RuntimeMetadata {
  pallets: {
    name: string;
    index: number;
    storage: { name: string }[];
    calls: { name: string }[];
    events: { name: string }[];
    constants?: { name: string }[];
    errors?: { name: string }[];
  }[];
}

interface IndexerExtraction {
  schema: {
    entities: { name: string; fields: { name: string }[] }[];
  };
  handlers?: { event: string; handler: string; file: string; line: number; createsEntities?: string[] }[];
}

interface SDKExtraction {
  packages: {
    name: string;
    methods: { name: string; file: string }[];
  }[];
}

interface UIExtraction {
  hooks: { name: string; file: string; line: number }[];
  sdkUsage: { file: string; call: string; line: number }[];
  indexerUsage: { file: string; query: string; line: number }[];
}

// Static analysis types
interface StaticAnalysisResult {
  hooks: HookTrace[];
  callGraph: CallGraphEdge[];
  stores?: StaticStore[];
  edges?: CanonicalEdge[];  // Unified edges array (reads, writes, queries, calls)
}

interface StaticStore {
  name: string;
  file: string;
  line: number;
  type: 'zustand' | 'jotai' | 'redux' | 'context' | 'custom';
  setters: string[];
  readers: string[];
  writers: string[];
}

interface HookTrace {
  name: string;
  file: string;
  line: number;
  runtimeCalls: RuntimeCallTrace[];
  importedCalls: {
    through: string;
    fromFile: string;
    calls: RuntimeCallTrace[];
  }[];
}

interface RuntimeCallTrace {
  type: 'query' | 'tx' | 'const' | 'api' | 'sdk';
  pattern: string;
  pallet: string;
  item: string;
  file: string;
  line: number;
}

interface CallGraphEdge {
  from: string;
  to: string;
  type: 'calls' | 'imports' | 'runtime';
}

interface CrossRefOptions {
  extractionsPath: string;
  outputPath: string;
}

// =============================================================================
// MAIN SYNTHESIS
// =============================================================================

export async function synthesizeCrossRef(options: CrossRefOptions): Promise<CanonicalIndex> {
  const { extractionsPath, outputPath } = options;

  log.section('Cross-Reference Index Generation (v2 - Canonical IDs)');

  const entries: Record<string, CanonicalEntry> = {};
  const edges: CanonicalEdge[] = [];

  // 1. Load all entities from each layer
  const runtimeCount = loadRuntimeEntries(extractionsPath, entries);
  log.info(`Loaded ${runtimeCount} runtime entities`);

  const indexerCount = loadIndexerEntries(extractionsPath, entries);
  log.info(`Loaded ${indexerCount} indexer entities`);

  const sdkCount = loadSDKEntries(extractionsPath, entries);
  log.info(`Loaded ${sdkCount} SDK entities`);

  const uiCount = loadUIEntries(extractionsPath, entries);
  log.info(`Loaded ${uiCount} UI entities`);

  // Load store entities and canonical edges from static analysis
  const staticAnalysis = loadStaticAnalysisEntities(extractionsPath, entries, edges);
  log.info(`Loaded ${staticAnalysis.stores} stores, ${staticAnalysis.edges} canonical edges from static analysis`);

  // 2. Build relationships by tracing code
  log.section('Building Relationships');

  const uiToRuntimeEdges = buildUIToRuntimeEdges(extractionsPath, entries, edges);
  log.info(`Built ${uiToRuntimeEdges} ui→runtime edges`);

  const uiToIndexerEdges = buildUIToIndexerEdges(extractionsPath, entries, edges);
  log.info(`Built ${uiToIndexerEdges} ui→indexer edges`);

  const indexerToRuntimeEdges = buildIndexerToRuntimeEdges(extractionsPath, entries, edges);
  log.info(`Built ${indexerToRuntimeEdges} indexer→runtime edges`);

  // 3. Build containment edges (parent-child)
  const containmentEdges = buildContainmentEdges(entries, edges);
  log.info(`Built ${containmentEdges} containment edges`);

  // 4. Compute stats
  const stats = computeStats(entries, edges);

  // 5. Build the index
  const index: CanonicalIndex = {
    version: '2.0.0',
    generatedAt: new Date().toISOString(),
    entries,
    edges,
    stats,
  };

  // 6. Write outputs
  mkdirSync(outputPath, { recursive: true });

  const indexPath = join(outputPath, 'cross-references.json');
  writeFileSync(indexPath, JSON.stringify(index, null, 2));
  log.success(`Written cross-reference index: ${indexPath}`);

  const summaryPath = join(outputPath, 'cross-references-summary.md');
  const summaryContent = generateAISummary(index);
  writeFileSync(summaryPath, summaryContent);
  log.success(`Written AI summary: ${summaryPath}`);

  // Copy to agents/contexts
  const agentsContextPath = './agents/contexts';
  if (existsSync(agentsContextPath)) {
    writeFileSync(join(agentsContextPath, 'CROSS_REFERENCES.md'), summaryContent);
    log.success(`Written AI context: ${agentsContextPath}/CROSS_REFERENCES.md`);
  }

  log.section('Generation Complete');
  console.log(`\n  Entries: ${Object.keys(entries).length}`);
  console.log(`  Edges: ${edges.length}`);
  console.log(`  Output: ${indexPath}\n`);

  return index;
}

// =============================================================================
// ENTITY LOADERS
// =============================================================================

function loadLatestExtraction<T>(baseDir: string, layer: string): T | null {
  const layerDir = join(baseDir, layer);
  if (!existsSync(layerDir)) return null;

  const files = readdirSync(layerDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) return null;

  // Priority order for finding extraction file
  for (const name of ['extraction.json', 'metadata.json', 'baseline.json']) {
    if (files.includes(name)) {
      return readJSON<T>(join(layerDir, name));
    }
  }

  // Fall back to newest file
  const sortedFiles = files.sort((a, b) => {
    const statA = statSync(join(layerDir, a));
    const statB = statSync(join(layerDir, b));
    return statB.mtime.getTime() - statA.mtime.getTime();
  });

  return readJSON<T>(join(layerDir, sortedFiles[0]));
}

function loadRuntimeEntries(extractionsPath: string, entries: Record<string, CanonicalEntry>): number {
  const metadata = loadLatestExtraction<RuntimeMetadata>(extractionsPath, 'metadata');
  if (!metadata) return 0;

  let count = 0;

  for (const pallet of metadata.pallets) {
    const palletId = runtime.pallet(pallet.name);

    // Add pallet
    entries[palletId] = {
      id: palletId,
      layer: 'runtime',
      type: 'pallet',
      name: pallet.name,
    };
    count++;

    // Add storage items
    if (pallet.storage) {
      for (const storage of pallet.storage) {
        const storageId = runtime.storage(pallet.name, storage.name);
        entries[storageId] = {
          id: storageId,
          layer: 'runtime',
          type: 'storage',
          name: storage.name,
          parent: palletId,
        };
        count++;
      }
    }

    // Add calls (extrinsics)
    if (pallet.calls) {
      for (const call of pallet.calls) {
        if (call.name.startsWith('__Unused')) continue;
        const callId = runtime.call(pallet.name, call.name);
        entries[callId] = {
          id: callId,
          layer: 'runtime',
          type: 'call',
          name: call.name,
          parent: palletId,
        };
        count++;
      }
    }

    // Add events
    if (pallet.events) {
      for (const event of pallet.events) {
        const eventId = runtime.event(pallet.name, event.name);
        entries[eventId] = {
          id: eventId,
          layer: 'runtime',
          type: 'event',
          name: event.name,
          parent: palletId,
        };
        count++;
      }
    }

    // Add errors
    if (pallet.errors) {
      for (const error of pallet.errors) {
        const errorId = runtime.error(pallet.name, error.name);
        entries[errorId] = {
          id: errorId,
          layer: 'runtime',
          type: 'error',
          name: error.name,
          parent: palletId,
        };
        count++;
      }
    }

    // Add constants
    if (pallet.constants) {
      for (const constant of pallet.constants) {
        const constId = runtime.const(pallet.name, constant.name);
        entries[constId] = {
          id: constId,
          layer: 'runtime',
          type: 'const',
          name: constant.name,
          parent: palletId,
        };
        count++;
      }
    }
  }

  return count;
}

function loadIndexerEntries(extractionsPath: string, entries: Record<string, CanonicalEntry>): number {
  const extraction = loadLatestExtraction<IndexerExtraction>(extractionsPath, 'indexer');
  if (!extraction?.schema?.entities) return 0;

  let count = 0;

  for (const entity of extraction.schema.entities) {
    const entityId = indexer.entity(entity.name);
    entries[entityId] = {
      id: entityId,
      layer: 'indexer',
      type: 'entity',
      name: entity.name,
    };
    count++;

    // Add fields if available
    if (entity.fields) {
      for (const field of entity.fields) {
        const fieldId = indexer.field(entity.name, field.name);
        entries[fieldId] = {
          id: fieldId,
          layer: 'indexer',
          type: 'field',
          name: field.name,
          parent: entityId,
        };
        count++;
      }
    }
  }

  // Add handlers if available
  if (extraction.handlers) {
    for (const handler of extraction.handlers) {
      const handlerId = indexer.handler(handler.handler);
      if (!entries[handlerId]) {
        entries[handlerId] = {
          id: handlerId,
          layer: 'indexer',
          type: 'handler',
          name: handler.handler,
          file: handler.file,
        };
        count++;
      }
    }
  }

  return count;
}

function loadSDKEntries(extractionsPath: string, entries: Record<string, CanonicalEntry>): number {
  const extraction = loadLatestExtraction<SDKExtraction>(extractionsPath, 'sdk');
  if (!extraction?.packages) return 0;

  let count = 0;

  for (const pkg of extraction.packages) {
    const pkgId = sdk.package(pkg.name);
    entries[pkgId] = {
      id: pkgId,
      layer: 'sdk',
      type: 'package',
      name: pkg.name,
    };
    count++;

    if (pkg.methods) {
      for (const method of pkg.methods) {
        const methodId = sdk.method(pkg.name, method.name);
        entries[methodId] = {
          id: methodId,
          layer: 'sdk',
          type: 'method',
          name: method.name,
          parent: pkgId,
          file: method.file,
        };
        count++;
      }
    }
  }

  return count;
}

function loadUIEntries(extractionsPath: string, entries: Record<string, CanonicalEntry>): number {
  const extraction = loadLatestExtraction<UIExtraction>(extractionsPath, 'ui');
  if (!extraction?.hooks) return 0;

  for (const hook of extraction.hooks) {
    const hookId = ui.hook(hook.name);
    entries[hookId] = {
      id: hookId,
      layer: 'ui',
      type: 'hook',
      name: hook.name,
      file: hook.file,
      line: hook.line,
    };
  }

  return extraction.hooks.length;
}

/**
 * Load store entities and all canonical edges from static analysis
 */
function loadStaticAnalysisEntities(
  extractionsPath: string,
  entries: Record<string, CanonicalEntry>,
  edges: CanonicalEdge[]
): { stores: number; edges: number } {
  const analysis = loadStaticAnalysis(extractionsPath);
  if (!analysis) return { stores: 0, edges: 0 };

  let storeCount = 0;
  let edgeCount = 0;

  // Load store entities
  if (analysis.stores) {
    for (const store of analysis.stores) {
      const storeId = ui.store(store.name);
      entries[storeId] = {
        id: storeId,
        layer: 'ui',
        type: 'store',
        name: store.name,
        file: store.file,
        line: store.line,
        metadata: {
          storeType: store.type,
          setters: store.setters,
          readers: store.readers?.length ?? 0,
          writers: store.writers?.length ?? 0,
        },
      };
      storeCount++;
    }
  }

  // Load all canonical edges from static analysis
  if (analysis.edges) {
    for (const edge of analysis.edges) {
      // For store edges (reads/writes), both endpoints must exist
      // For runtime edges (queries/calls), we add the edge even if target doesn't exist yet
      // (it may be added when runtime metadata is loaded)
      const isStoreEdge = edge.type === 'reads' || edge.type === 'writes';

      if (isStoreEdge) {
        // Store edges require both endpoints
        if (!entries[edge.from] || !entries[edge.to]) continue;
      } else {
        // Runtime edges only require the source (hook) to exist
        if (!entries[edge.from]) continue;
      }

      // Check for duplicates
      const exists = edges.some(
        e => e.from === edge.from && e.to === edge.to && e.type === edge.type
      );
      if (!exists) {
        edges.push(edge);
        edgeCount++;
      }
    }
  }

  return { stores: storeCount, edges: edgeCount };
}

// =============================================================================
// EDGE BUILDERS
// =============================================================================

function addEdge(
  edges: CanonicalEdge[],
  entries: Record<string, CanonicalEntry>,
  from: string,
  to: string,
  type: EdgeType
): boolean {
  // Validate both ends exist
  if (!entries[from] || !entries[to]) return false;

  // Check for duplicates
  const exists = edges.some(e => e.from === from && e.to === to && e.type === type);
  if (exists) return false;

  edges.push({ from, to, type });
  return true;
}

/**
 * Load static analysis results
 */
function loadStaticAnalysis(extractionsPath: string): StaticAnalysisResult | null {
  const analysisPath = join(extractionsPath, 'ui', 'static-analysis.json');
  if (!existsSync(analysisPath)) return null;
  return readJSON<StaticAnalysisResult>(analysisPath);
}

/**
 * Build UI → Runtime edges using static analysis (preferred)
 * Falls back to file-based matching if static analysis not available
 */
function buildUIToRuntimeEdges(
  extractionsPath: string,
  entries: Record<string, CanonicalEntry>,
  edges: CanonicalEdge[]
): number {
  // Try static analysis first (more accurate)
  const staticAnalysis = loadStaticAnalysis(extractionsPath);
  if (staticAnalysis?.hooks) {
    return buildUIToRuntimeEdgesFromStaticAnalysis(staticAnalysis, entries, edges);
  }

  // Fall back to legacy file-based method
  return buildUIToRuntimeEdgesLegacy(extractionsPath, entries, edges);
}

/**
 * Build edges from static analysis hook traces (accurate import chain tracing)
 */
function buildUIToRuntimeEdgesFromStaticAnalysis(
  analysis: StaticAnalysisResult,
  entries: Record<string, CanonicalEntry>,
  edges: CanonicalEdge[]
): number {
  let count = 0;

  for (const hook of analysis.hooks) {
    const hookId = ui.hook(hook.name);

    // Ensure hook entry exists
    if (!entries[hookId]) {
      entries[hookId] = {
        id: hookId,
        layer: 'ui',
        type: 'hook',
        name: hook.name,
        file: hook.file,
        line: hook.line,
      };
    }

    // Collect all runtime calls (direct + imported)
    const allCalls = [
      ...hook.runtimeCalls,
      ...hook.importedCalls.flatMap(ic => ic.calls),
    ];

    for (const call of allCalls) {
      const targets = resolveRuntimeCallToEntries(call, entries);

      for (const target of targets) {
        if (addEdge(edges, entries, hookId, target.id, target.type)) {
          count++;
        }
      }
    }
  }

  return count;
}

/**
 * Resolve a runtime call to canonical entries
 */
function resolveRuntimeCallToEntries(
  call: RuntimeCallTrace,
  entries: Record<string, CanonicalEntry>
): { id: string; type: EdgeType }[] {
  const results: { id: string; type: EdgeType }[] = [];

  // Determine edge type based on call type
  let edgeType: EdgeType = 'queries';
  if (call.type === 'tx') edgeType = 'calls';
  else if (call.type === 'sdk') edgeType = 'uses';
  else if (call.type === 'const') edgeType = 'queries';
  else if (call.type === 'api') edgeType = 'queries';

  // For SDK calls, use the mapping
  if (call.type === 'sdk') {
    const pallets = mapSdkApiToPallets(`sdk.api.${call.pallet}.${call.item}`);
    for (const palletName of pallets) {
      const palletId = runtime.pallet(palletName);
      if (entries[palletId]) {
        results.push({ id: palletId, type: 'uses' });
      }
    }
    return results;
  }

  // For query/tx/const, try to match specific item first
  if (call.type === 'query') {
    const storageId = runtime.storage(call.pallet, call.item);
    if (entries[storageId]) {
      results.push({ id: storageId, type: 'queries' });
      return results;
    }
  } else if (call.type === 'tx') {
    const callId = runtime.call(call.pallet, call.item);
    if (entries[callId]) {
      results.push({ id: callId, type: 'calls' });
      return results;
    }
  } else if (call.type === 'const') {
    const constId = runtime.const(call.pallet, call.item);
    if (entries[constId]) {
      results.push({ id: constId, type: 'queries' });
      return results;
    }
  }

  // Fall back to pallet level
  const palletId = runtime.pallet(call.pallet);
  if (entries[palletId]) {
    results.push({ id: palletId, type: edgeType });
  }

  return results;
}

/**
 * Legacy: Build UI → Runtime edges from file-based SDK usage (less accurate)
 */
function buildUIToRuntimeEdgesLegacy(
  extractionsPath: string,
  entries: Record<string, CanonicalEntry>,
  edges: CanonicalEdge[]
): number {
  const extraction = loadLatestExtraction<UIExtraction>(extractionsPath, 'ui');
  if (!extraction?.sdkUsage) return 0;

  let count = 0;

  // Build file → hooks map
  const fileToHooks = new Map<string, string[]>();
  for (const hook of extraction.hooks) {
    if (!fileToHooks.has(hook.file)) fileToHooks.set(hook.file, []);
    fileToHooks.get(hook.file)!.push(hook.name);
  }

  // Process each SDK usage to find runtime references
  for (const usage of extraction.sdkUsage) {
    const call = usage.call;
    const targetIds: { id: string; type: EdgeType }[] = [];

    // Parse: query.Pallet.Storage or tx.Pallet.extrinsic
    if (call.startsWith('query.') || call.startsWith('papi.query.')) {
      const parts = call.replace('papi.query.', '').replace('query.', '').split('.');
      if (parts.length >= 2) {
        const [palletName, storageName] = parts;
        // Try specific storage first
        const storageId = runtime.storage(palletName, storageName);
        if (entries[storageId]) {
          targetIds.push({ id: storageId, type: 'queries' });
        } else {
          // Fall back to pallet
          const palletId = runtime.pallet(palletName);
          if (entries[palletId]) {
            targetIds.push({ id: palletId, type: 'queries' });
          }
        }
      }
    } else if (call.startsWith('tx.')) {
      const parts = call.replace('tx.', '').split('.');
      if (parts.length >= 2) {
        const [palletName, callName] = parts;
        // Try specific call first
        const callId = runtime.call(palletName, callName);
        if (entries[callId]) {
          targetIds.push({ id: callId, type: 'calls' });
        } else {
          // Fall back to pallet
          const palletId = runtime.pallet(palletName);
          if (entries[palletId]) {
            targetIds.push({ id: palletId, type: 'calls' });
          }
        }
      }
    } else if (call.startsWith('sdk.api.') || call.startsWith('sdk.client.')) {
      // SDK high-level API - map to relevant pallets
      const pallets = mapSdkApiToPallets(call);
      for (const palletName of pallets) {
        const palletId = runtime.pallet(palletName);
        if (entries[palletId]) {
          targetIds.push({ id: palletId, type: 'uses' });
        }
      }
    }

    // Add edges from all hooks in the same file
    const hooks = fileToHooks.get(usage.file) || [];
    for (const hookName of hooks) {
      const hookId = ui.hook(hookName);
      for (const target of targetIds) {
        if (addEdge(edges, entries, hookId, target.id, target.type)) {
          count++;
        }
      }
    }
  }

  return count;
}

/**
 * Map SDK high-level API calls to runtime pallets.
 */
function mapSdkApiToPallets(call: string): string[] {
  const mappings: Record<string, string[]> = {
    'sdk.api.router': ['Router', 'Omnipool', 'XYK', 'Stableswap', 'LBP'],
    'sdk.api.pools': ['Omnipool', 'XYK', 'Stableswap', 'LBP'],
    'sdk.api.omnipool': ['Omnipool', 'OmnipoolLiquidityMining'],
    'sdk.api.xyk': ['XYK', 'XYKLiquidityMining'],
    'sdk.api.stableswap': ['Stableswap'],
    'sdk.api.lbp': ['LBP'],
    'sdk.api.staking': ['Staking'],
    'sdk.api.farming': ['OmnipoolLiquidityMining', 'XYKLiquidityMining'],
    'sdk.api.dca': ['DCA'],
    'sdk.api.otc': ['OTC'],
    'sdk.client.asset': ['AssetRegistry', 'Tokens'],
    'sdk.client.balance': ['Balances', 'Tokens'],
  };

  for (const [pattern, pallets] of Object.entries(mappings)) {
    if (call.startsWith(pattern)) {
      return pallets;
    }
  }

  return [];
}

/**
 * Build UI → Indexer edges from GraphQL queries
 */
function buildUIToIndexerEdges(
  extractionsPath: string,
  entries: Record<string, CanonicalEntry>,
  edges: CanonicalEdge[]
): number {
  const extraction = loadLatestExtraction<UIExtraction>(extractionsPath, 'ui');
  if (!extraction?.indexerUsage) return 0;

  let count = 0;

  // Build file → hooks map
  const fileToHooks = new Map<string, string[]>();
  for (const hook of extraction.hooks) {
    if (!fileToHooks.has(hook.file)) fileToHooks.set(hook.file, []);
    fileToHooks.get(hook.file)!.push(hook.name);
  }

  // Get all entity names for matching
  const entityNames = Object.values(entries)
    .filter(e => e.layer === 'indexer' && e.type === 'entity')
    .map(e => e.name);

  // Process each indexer usage
  for (const usage of extraction.indexerUsage) {
    const query = usage.query;
    const matchedEntities = new Set<string>();

    // Direct entity name match
    for (const name of entityNames) {
      if (query.includes(name)) {
        matchedEntities.add(name);
      }
    }

    // Keyword-based matching
    const queryKeywords = query
      .replace(/^(indexer|indexerSdk)\./, '')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .split(/\s+/)
      .filter(k => k.length >= 3 && !['query', 'use', 'events', 'data', 'list'].includes(k));

    for (const keyword of queryKeywords) {
      for (const entityName of entityNames) {
        if (entityName.toLowerCase().includes(keyword)) {
          matchedEntities.add(entityName);
        }
      }
    }

    // Add edges
    const hooks = fileToHooks.get(usage.file) || [];
    for (const entityName of matchedEntities) {
      const entityId = indexer.entity(entityName);
      for (const hookName of hooks) {
        const hookId = ui.hook(hookName);
        if (addEdge(edges, entries, hookId, entityId, 'queries')) {
          count++;
        }
      }
    }
  }

  return count;
}

/**
 * Build Indexer → Runtime edges from event handlers
 */
function buildIndexerToRuntimeEdges(
  extractionsPath: string,
  entries: Record<string, CanonicalEntry>,
  edges: CanonicalEdge[]
): number {
  const extraction = loadLatestExtraction<IndexerExtraction>(extractionsPath, 'indexer');
  if (!extraction) return 0;

  let count = 0;

  // Get all pallet names
  const palletNames = Object.values(entries)
    .filter(e => e.layer === 'runtime' && e.type === 'pallet')
    .map(e => e.name);

  // Match entities to pallets by name prefix (e.g., OmnipoolAsset → Omnipool)
  for (const entry of Object.values(entries)) {
    if (entry.layer !== 'indexer' || entry.type !== 'entity') continue;

    const entityNameLower = entry.name.toLowerCase();
    for (const palletName of palletNames) {
      if (entityNameLower.startsWith(palletName.toLowerCase())) {
        const palletId = runtime.pallet(palletName);
        if (addEdge(edges, entries, entry.id, palletId, 'handles')) {
          count++;
        }
        break;
      }
    }
  }

  // Build entity→pallet edges from handler's createsEntities (exact static analysis)
  if (extraction.handlers) {
    for (const handler of extraction.handlers) {
      if (!handler.createsEntities || handler.createsEntities.length === 0) continue;

      // Get pallet from event (e.g., "AssetRegistry.Registered" → "AssetRegistry")
      const [palletName] = handler.event.split('.');
      if (!palletName) continue;

      // Find the matching runtime pallet (case-insensitive)
      const matchedPallet = palletNames.find(p => p.toLowerCase() === palletName.toLowerCase());
      if (!matchedPallet) continue;

      const palletId = runtime.pallet(matchedPallet);

      // Link each entity this handler creates/updates to the pallet
      for (const entityName of handler.createsEntities) {
        const entityId = indexer.entity(entityName);
        if (entries[entityId]) {
          if (addEdge(edges, entries, entityId, palletId, 'handles')) {
            count++;
          }
        }
      }
    }
  }

  // Link handlers to events if available
  if (extraction.handlers) {
    for (const handler of extraction.handlers) {
      const handlerId = indexer.handler(handler.handler);
      if (!entries[handlerId]) continue;

      // Parse event name (e.g., "Omnipool.LiquidityAdded")
      const [palletName, eventName] = handler.event.split('.');
      if (palletName && eventName) {
        const eventId = runtime.event(palletName, eventName);
        if (entries[eventId]) {
          if (addEdge(edges, entries, handlerId, eventId, 'handles')) {
            count++;
          }
        }
      }
    }
  }

  return count;
}

/**
 * Build containment edges (parent → child)
 */
function buildContainmentEdges(
  entries: Record<string, CanonicalEntry>,
  edges: CanonicalEdge[]
): number {
  let count = 0;

  for (const entry of Object.values(entries)) {
    if (entry.parent && entries[entry.parent]) {
      if (addEdge(edges, entries, entry.parent, entry.id, 'contains')) {
        count++;
      }
    }
  }

  return count;
}

// =============================================================================
// STATS & SUMMARY
// =============================================================================

function computeStats(
  entries: Record<string, CanonicalEntry>,
  edges: CanonicalEdge[]
): CanonicalIndex['stats'] {
  const entriesByLayer: Record<Layer, number> = {
    runtime: 0,
    sdk: 0,
    indexer: 0,
    ui: 0,
  };

  for (const entry of Object.values(entries)) {
    entriesByLayer[entry.layer]++;
  }

  const edgesByType: Record<EdgeType, number> = {
    calls: 0,
    queries: 0,
    handles: 0,
    reads: 0,
    writes: 0,
    uses: 0,
    contains: 0,
  };

  for (const edge of edges) {
    edgesByType[edge.type]++;
  }

  return { entriesByLayer, edgesByType };
}

function generateAISummary(index: CanonicalIndex): string {
  const { stats, edges } = index;

  // Count relationships per pallet
  const palletConnections = new Map<string, { ui: Set<string>; indexer: Set<string> }>();

  for (const edge of edges) {
    if (edge.type === 'contains') continue;

    try {
      const toParsed = parseCanonicalId(edge.to);
      if (toParsed.layer !== 'runtime') continue;

      // Get pallet name
      const palletName = toParsed.segments[0]?.name;
      if (!palletName) continue;

      if (!palletConnections.has(palletName)) {
        palletConnections.set(palletName, { ui: new Set(), indexer: new Set() });
      }

      const fromParsed = parseCanonicalId(edge.from);
      const conn = palletConnections.get(palletName)!;

      if (fromParsed.layer === 'ui') {
        conn.ui.add(edge.from);
      } else if (fromParsed.layer === 'indexer') {
        conn.indexer.add(edge.from);
      }
    } catch {
      continue;
    }
  }

  const lines: string[] = [
    '# Cross-Reference Index Summary (v2)',
    '',
    'Canonical ID-based mappings between all Hydration Protocol entities.',
    '',
    `Generated: ${index.generatedAt}`,
    `Version: ${index.version}`,
    '',
    '## ID Format',
    '',
    '```',
    'layer:type:Name[:type:Name...]',
    '',
    'Examples:',
    '  runtime:pallet:Omnipool:call:add_liquidity',
    '  ui:hook:useAddLiquidity',
    '  indexer:entity:OmnipoolAsset',
    '```',
    '',
    '## Statistics',
    '',
    '### Entries by Layer',
    '',
    '| Layer | Count |',
    '|-------|-------|',
    `| Runtime | ${stats.entriesByLayer.runtime} |`,
    `| SDK | ${stats.entriesByLayer.sdk} |`,
    `| Indexer | ${stats.entriesByLayer.indexer} |`,
    `| UI | ${stats.entriesByLayer.ui} |`,
    '',
    '### Edges by Type',
    '',
    '| Type | Count | Meaning |',
    '|------|-------|---------|',
    `| calls | ${stats.edgesByType.calls} | Submits extrinsic |`,
    `| queries | ${stats.edgesByType.queries} | Reads storage/data |`,
    `| handles | ${stats.edgesByType.handles} | Processes event |`,
    `| reads | ${stats.edgesByType.reads} | Reads from store |`,
    `| writes | ${stats.edgesByType.writes} | Writes to store |`,
    `| uses | ${stats.edgesByType.uses} | Generic dependency |`,
    `| contains | ${stats.edgesByType.contains} | Parent → child |`,
    '',
    '## Top Connected Pallets',
    '',
  ];

  const pallets = [...palletConnections.entries()]
    .map(([name, conn]) => ({
      name,
      ui: conn.ui.size,
      indexer: conn.indexer.size,
      total: conn.ui.size + conn.indexer.size,
    }))
    .filter(p => p.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);

  lines.push('| Pallet | UI Hooks | Indexer | Total |');
  lines.push('|--------|----------|---------|-------|');
  for (const p of pallets) {
    lines.push(`| ${p.name} | ${p.ui} | ${p.indexer} | ${p.total} |`);
  }

  lines.push('');
  lines.push('## Usage');
  lines.push('');
  lines.push('```typescript');
  lines.push('import { parseCanonicalId, runtime, ui } from "./schemas/canonical-ids";');
  lines.push('');
  lines.push('// Build IDs');
  lines.push('const palletId = runtime.pallet("Omnipool");');
  lines.push('const callId = runtime.call("Omnipool", "add_liquidity");');
  lines.push('const hookId = ui.hook("useAddLiquidity");');
  lines.push('');
  lines.push('// Parse IDs');
  lines.push('const parsed = parseCanonicalId("runtime:pallet:Omnipool:call:add_liquidity");');
  lines.push('// => { layer: "runtime", segments: [...] }');
  lines.push('```');
  lines.push('');
  lines.push('## References');
  lines.push('');
  lines.push('- Schema: `src/schemas/canonical-ids.ts`');
  lines.push('- Design: `proposals/canonical-ids.md`');
  lines.push('- AI Guide: `agents/contexts/CANONICAL_IDS.md`');
  lines.push('');

  return lines.join('\n');
}

// =============================================================================
// CLI
// =============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const extractionsPath = process.env.EXTRACTIONS_PATH || './raw';
  const outputPath = process.env.OUTPUT_PATH || './docs-site/static';

  synthesizeCrossRef({
    extractionsPath,
    outputPath,
  }).catch((err) => {
    console.error('Cross-reference generation failed:', err);
    process.exit(1);
  });
}
