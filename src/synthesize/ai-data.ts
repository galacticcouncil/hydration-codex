/**
 * AI Data Synthesizer
 *
 * Generates tiered JSON files optimized for AI agent consumption.
 *
 * Tier 0: Manifest (~500 tokens) - File index with sizes and purposes
 * Tier 1: Layer indexes (~2-5K tokens) - Summary per layer
 * Tier 2: Domain detail (~5-15K tokens) - Detailed data by domain
 * Tier 3: Cross-references (~5-10K tokens) - Relationship data
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const EXTRACTIONS_PATH = process.env.EXTRACTIONS_PATH || './extractions';
const OUTPUT_PATH = process.env.OUTPUT_PATH || './docs-site/static/ai';

interface AiFile {
  path: string;
  tier: number;
  tokens: number;
  purpose: string;
  loadWhen: string;
}

interface Manifest {
  version: string;
  generatedAt: string;
  tiers: {
    description: string;
    targetTokens: string;
  }[];
  files: AiFile[];
  quickStart: string[];
}

function estimateTokens(content: string): number {
  return Math.ceil(content.length / 4);
}

function loadJson(path: string): unknown {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function saveJson(path: string, data: unknown): number {
  const content = JSON.stringify(data, null, 2);
  writeFileSync(path, content);
  return estimateTokens(content);
}

// ============================================================================
// Tier 1: Layer Indexes
// ============================================================================

interface RuntimeIndex {
  version: string;
  palletCount: number;
  pallets: {
    name: string;
    index: number;
    storageCount: number;
    callCount: number;
    eventCount: number;
    constantCount: number;
  }[];
}

function generateRuntimeIndex(): RuntimeIndex {
  const metadataPath = join(EXTRACTIONS_PATH, 'metadata/metadata.json');
  const metadata = loadJson(metadataPath) as {
    pallets?: { name: string; index: number; storage?: { items?: unknown[] }; calls?: unknown[]; events?: unknown[]; constants?: unknown[] }[];
  } | null;

  if (!metadata?.pallets) {
    return { version: '1.0.0', palletCount: 0, pallets: [] };
  }

  const pallets = metadata.pallets.map((p) => ({
    name: p.name,
    index: p.index,
    storageCount: p.storage?.items?.length || 0,
    callCount: p.calls?.length || 0,
    eventCount: p.events?.length || 0,
    constantCount: p.constants?.length || 0,
  }));

  return {
    version: '1.0.0',
    palletCount: pallets.length,
    pallets: pallets.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

interface SdkIndex {
  version: string;
  packageCount: number;
  packages: {
    name: string;
    shortName: string;
    methodCount: number;
    description?: string;
  }[];
}

function generateSdkIndex(): SdkIndex {
  const sdkPath = join(EXTRACTIONS_PATH, 'sdk/extraction.json');
  const sdk = loadJson(sdkPath) as {
    packages?: { name: string; methods?: unknown[]; readme?: string }[];
  } | null;

  if (!sdk?.packages) {
    return { version: '1.0.0', packageCount: 0, packages: [] };
  }

  const packages = sdk.packages.map((p) => ({
    name: p.name,
    shortName: p.name.replace('@galacticcouncil/', ''),
    methodCount: p.methods?.length || 0,
    description: p.readme?.split('\n')[0]?.replace(/^#\s*/, '').slice(0, 100),
  }));

  return {
    version: '1.0.0',
    packageCount: packages.length,
    packages: packages.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

interface IndexerIndex {
  version: string;
  entityCount: number;
  entities: {
    name: string;
    fieldCount: number;
    isEvent: boolean;
  }[];
}

function generateIndexerIndex(): IndexerIndex {
  const indexerPath = join(EXTRACTIONS_PATH, 'indexer/extraction.json');
  const indexer = loadJson(indexerPath) as {
    schema?: { entities?: { name: string; fields?: unknown[] }[] };
  } | null;

  if (!indexer?.schema?.entities) {
    return { version: '1.0.0', entityCount: 0, entities: [] };
  }

  const entities = indexer.schema.entities.map((e) => ({
    name: e.name,
    fieldCount: e.fields?.length || 0,
    isEvent: e.name.endsWith('Data') || e.name.endsWith('Event'),
  }));

  return {
    version: '1.0.0',
    entityCount: entities.length,
    entities: entities.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

interface UiIndex {
  version: string;
  hookCount: number;
  categories: {
    name: string;
    count: number;
    hooks: string[];
  }[];
}

function generateUiIndex(): UiIndex {
  const hookIndexPath = './docs-site/static/hook-index.json';
  const hookIndex = loadJson(hookIndexPath) as Record<string, { category: string }> | null;

  if (!hookIndex) {
    return { version: '1.0.0', hookCount: 0, categories: [] };
  }

  const byCategory: Record<string, string[]> = {};
  for (const [name, data] of Object.entries(hookIndex)) {
    const cat = data.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(name);
  }

  const categories = Object.entries(byCategory)
    .map(([name, hooks]) => ({
      name,
      count: hooks.length,
      hooks: hooks.sort(),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    version: '1.0.0',
    hookCount: Object.keys(hookIndex).length,
    categories,
  };
}

// ============================================================================
// Tier 3: Cross-References (split by type)
// ============================================================================

interface XrefEdges {
  version: string;
  edgeCount: number;
  byType: Record<string, { from: string; to: string }[]>;
}

function generateXrefEdges(): XrefEdges {
  const xrefPath = './docs-site/static/cross-references.json';
  const xref = loadJson(xrefPath) as {
    edges?: { from: string; to: string; type: string }[];
  } | null;

  if (!xref?.edges) {
    return { version: '1.0.0', edgeCount: 0, byType: {} };
  }

  // Filter out "contains" edges (structural, not useful for AI)
  const usefulEdges = xref.edges.filter((e) => e.type !== 'contains');

  const byType: Record<string, { from: string; to: string }[]> = {};
  for (const edge of usefulEdges) {
    if (!byType[edge.type]) byType[edge.type] = [];
    byType[edge.type].push({ from: edge.from, to: edge.to });
  }

  return {
    version: '1.0.0',
    edgeCount: usefulEdges.length,
    byType,
  };
}

interface XrefUiRuntime {
  version: string;
  connections: {
    hook: string;
    category: string;
    palletCalls: string[];
    palletQueries: string[];
  }[];
}

function generateXrefUiRuntime(): XrefUiRuntime {
  const xrefPath = './docs-site/static/cross-references.json';
  const xref = loadJson(xrefPath) as {
    edges?: { from: string; to: string; type: string }[];
    entries?: Record<string, { layer: string; type: string; name: string; parent?: string }>;
  } | null;

  const hookIndexPath = './docs-site/static/hook-index.json';
  const hookIndex = loadJson(hookIndexPath) as Record<string, { category: string }> | null;

  if (!xref?.edges || !hookIndex) {
    return { version: '1.0.0', connections: [] };
  }

  // Find UI → Runtime edges
  const hookConnections: Record<string, { calls: Set<string>; queries: Set<string> }> = {};

  for (const edge of xref.edges) {
    if (!edge.from || !edge.to) continue;
    if (!edge.from.startsWith('ui:hook:')) continue;
    if (!edge.to.startsWith('runtime:')) continue;

    const hookName = edge.from.replace('ui:hook:', '');
    if (!hookConnections[hookName]) {
      hookConnections[hookName] = { calls: new Set(), queries: new Set() };
    }

    // Extract pallet.call format
    const targetParts = edge.to.split(':');
    if (targetParts.length >= 4) {
      const pallet = targetParts[2];
      const item = targetParts[4] || targetParts[3];
      const ref = `${pallet}.${item}`;

      if (edge.type === 'calls') {
        hookConnections[hookName].calls.add(ref);
      } else if (edge.type === 'queries') {
        hookConnections[hookName].queries.add(ref);
      }
    }
  }

  const connections = Object.entries(hookConnections)
    .filter(([_, data]) => data.calls.size > 0 || data.queries.size > 0)
    .map(([hook, data]) => ({
      hook,
      category: hookIndex[hook]?.category || 'unknown',
      palletCalls: Array.from(data.calls).sort(),
      palletQueries: Array.from(data.queries).sort(),
    }))
    .sort((a, b) => a.hook.localeCompare(b.hook));

  return { version: '1.0.0', connections };
}

// ============================================================================
// Tier 0: Manifest
// ============================================================================

function generateManifest(files: AiFile[]): Manifest {
  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    tiers: [
      { description: 'Manifest - what files exist', targetTokens: '<500' },
      { description: 'Layer indexes - summary per layer', targetTokens: '2-5K' },
      { description: 'Domain detail - by category', targetTokens: '5-15K' },
      { description: 'Cross-references - relationships', targetTokens: '5-10K' },
    ],
    files: files.sort((a, b) => a.tier - b.tier || a.path.localeCompare(b.path)),
    quickStart: [
      '1. Load ai-manifest.json to see all available files',
      '2. Load {layer}-index.json for the layer you need',
      '3. Load specific domain files as needed',
      '4. Use xref files to find cross-layer connections',
    ],
  };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('Generating AI data files...\n');

  const files: AiFile[] = [];

  // Tier 1: Layer indexes
  console.log('Tier 1: Layer indexes');

  const runtimeIndex = generateRuntimeIndex();
  const runtimeTokens = saveJson(join(OUTPUT_PATH, 'runtime-index.json'), runtimeIndex);
  console.log(`  runtime-index.json: ${runtimeIndex.palletCount} pallets, ~${runtimeTokens} tokens`);
  files.push({
    path: 'ai/runtime-index.json',
    tier: 1,
    tokens: runtimeTokens,
    purpose: 'All pallets with storage/call/event counts',
    loadWhen: 'Working with runtime/pallets',
  });

  const sdkIndex = generateSdkIndex();
  const sdkTokens = saveJson(join(OUTPUT_PATH, 'sdk-index.json'), sdkIndex);
  console.log(`  sdk-index.json: ${sdkIndex.packageCount} packages, ~${sdkTokens} tokens`);
  files.push({
    path: 'ai/sdk-index.json',
    tier: 1,
    tokens: sdkTokens,
    purpose: 'All SDK packages with method counts',
    loadWhen: 'Working with SDK',
  });

  const indexerIndex = generateIndexerIndex();
  const indexerTokens = saveJson(join(OUTPUT_PATH, 'indexer-index.json'), indexerIndex);
  console.log(`  indexer-index.json: ${indexerIndex.entityCount} entities, ~${indexerTokens} tokens`);
  files.push({
    path: 'ai/indexer-index.json',
    tier: 1,
    tokens: indexerTokens,
    purpose: 'All indexer entities with field counts',
    loadWhen: 'Working with indexer/GraphQL',
  });

  const uiIndex = generateUiIndex();
  const uiTokens = saveJson(join(OUTPUT_PATH, 'ui-index.json'), uiIndex);
  console.log(`  ui-index.json: ${uiIndex.hookCount} hooks in ${uiIndex.categories.length} categories, ~${uiTokens} tokens`);
  files.push({
    path: 'ai/ui-index.json',
    tier: 1,
    tokens: uiTokens,
    purpose: 'All hooks grouped by category',
    loadWhen: 'Working with UI/React hooks',
  });

  // Tier 3: Cross-references
  console.log('\nTier 3: Cross-references');

  const xrefEdges = generateXrefEdges();
  const xrefEdgesTokens = saveJson(join(OUTPUT_PATH, 'xref-edges.json'), xrefEdges);
  console.log(`  xref-edges.json: ${xrefEdges.edgeCount} edges, ~${xrefEdgesTokens} tokens`);
  files.push({
    path: 'ai/xref-edges.json',
    tier: 3,
    tokens: xrefEdgesTokens,
    purpose: 'All cross-layer relationships (calls, queries, handles)',
    loadWhen: 'Finding connections between layers',
  });

  const xrefUiRuntime = generateXrefUiRuntime();
  const xrefUiRuntimeTokens = saveJson(join(OUTPUT_PATH, 'xref-ui-runtime.json'), xrefUiRuntime);
  console.log(`  xref-ui-runtime.json: ${xrefUiRuntime.connections.length} hook→runtime connections, ~${xrefUiRuntimeTokens} tokens`);
  files.push({
    path: 'ai/xref-ui-runtime.json',
    tier: 3,
    tokens: xrefUiRuntimeTokens,
    purpose: 'Which runtime calls each UI hook makes',
    loadWhen: 'Tracing UI to runtime',
  });

  // Tier 0: Manifest
  console.log('\nTier 0: Manifest');
  const manifest = generateManifest(files);
  const manifestTokens = saveJson(join(OUTPUT_PATH, 'ai-manifest.json'), manifest);
  console.log(`  ai-manifest.json: ${files.length} files indexed, ~${manifestTokens} tokens`);

  // Summary
  console.log('\n=== Summary ===');
  const totalTokens = files.reduce((sum, f) => sum + f.tokens, 0) + manifestTokens;
  console.log(`Total files: ${files.length + 1}`);
  console.log(`Total tokens: ~${totalTokens}`);
  console.log(`\nFiles written to: ${OUTPUT_PATH}/`);
}

main().catch(console.error);
