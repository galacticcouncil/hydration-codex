import { join } from 'path';
import { existsSync, readlinkSync } from 'fs';
import { createLogger } from '../utils/logger.js';
import { readJSON, writeJSON, writeFile } from '../utils/files.js';
import type {
  RuntimeExtraction,
  SDKExtraction,
  IndexerExtraction,
  UIExtraction,
} from '../schemas/extraction.js';

const log = createLogger('synthesize');

// Chain metadata structure (from extract:chain)
interface ChainPallet {
  name: string;
  index: number;
  calls: string[];
  events: string[];
  storage: string[];
  constants: string[];
}

interface ChainMetadata {
  extractedAt: string;
  source: string;
  specVersion: number;
  pallets: ChainPallet[];
  stats: { pallets: number; calls: number; events: number; storage: number };
}

// A cross-ref only counts if ≥2 layers are connected
interface CrossRef {
  pallet: string;
  feature: string;  // extrinsic or event name
  type: 'extrinsic' | 'event';
  layers: {
    runtime: boolean;
    sdk?: string;      // method name if present
    indexer?: string;  // handler name if present
    ui?: string;       // component name if present
  };
  coverage: number;  // count of layers (2-4)
}

interface Coverage {
  total: { extrinsics: number; events: number };
  indexed: { extrinsics: number; events: number };
  sdkWrapped: { extrinsics: number; events: number };
  uiUsed: { extrinsics: number; events: number };
}

interface SynthesisResult {
  synthesizedAt: string;
  commits: {
    runtime: string;
    sdk: string;
    indexer: string;
    ui: string;
  };
  coverage: Coverage;
  crossRefs: CrossRef[];  // only items with ≥2 layers
  gaps: {
    unindexedEvents: string[];    // pallet.Event
    unwrappedExtrinsics: string[]; // pallet.extrinsic
  };
}

// Normalize names for comparison
function normalize(name: string): string {
  return name.replace(/[-_]/g, '').toLowerCase();
}

// Build cross-refs using chain metadata as source of truth
function buildCrossRefsFromChain(
  chainMeta: ChainMetadata,
  sdk: SDKExtraction,
  indexer: IndexerExtraction,
  ui: UIExtraction
): { crossRefs: CrossRef[]; coverage: Coverage; gaps: SynthesisResult['gaps'] } {

  // Build SDK tx lookup: normalized call -> original call
  const sdkTxMap = new Map<string, string>();
  for (const tx of sdk.apiCalls.tx) {
    // SDK calls are like "omnipool.buy" or "DCA.schedule"
    sdkTxMap.set(normalize(tx.call), tx.call);
  }

  // Build indexer event lookup
  const indexerEventMap = new Map<string, string>();
  for (const h of indexer.handlers) {
    indexerEventMap.set(normalize(h.event), h.handler);
  }

  // Build UI tx lookup
  const uiTxMap = new Map<string, string>();
  for (const call of ui.sdkUsage) {
    if (call.call.includes('tx.')) {
      uiTxMap.set(normalize(call.call), call.file.split('/').pop() || call.file);
    }
  }

  const crossRefs: CrossRef[] = [];
  const gaps = {
    unindexedEvents: [] as string[],
    unwrappedExtrinsics: [] as string[],
  };

  const coverage: Coverage = {
    total: { extrinsics: 0, events: 0 },
    indexed: { extrinsics: 0, events: 0 },
    sdkWrapped: { extrinsics: 0, events: 0 },
    uiUsed: { extrinsics: 0, events: 0 },
  };

  for (const pallet of chainMeta.pallets) {
    const normalizedPallet = normalize(pallet.name);

    // Process extrinsics (calls in chain metadata)
    for (const call of pallet.calls) {
      // call is like "Omnipool.buy" - extract just the method name
      const parts = call.split('.');
      const methodName = parts[1] || call;

      // Skip internal hooks
      if (['on_initialize', 'on_finalize', 'on_idle', 'on_runtime_upgrade'].includes(methodName)) {
        continue;
      }

      coverage.total.extrinsics++;

      // Match against SDK: try "pallet.method" normalized
      const sdkKey = normalize(call);
      const sdkMethod = sdkTxMap.get(sdkKey);

      // Also try partial matches for UI
      const uiComponent = [...uiTxMap.entries()]
        .find(([k]) => k.includes(normalizedPallet) && k.includes(normalize(methodName)))?.[1];

      if (sdkMethod) coverage.sdkWrapped.extrinsics++;
      if (uiComponent) coverage.uiUsed.extrinsics++;

      const layerCount = 1 + (sdkMethod ? 1 : 0) + (uiComponent ? 1 : 0);

      if (layerCount >= 2) {
        crossRefs.push({
          pallet: pallet.name,
          feature: methodName,
          type: 'extrinsic',
          layers: {
            runtime: true,
            sdk: sdkMethod,
            ui: uiComponent,
          },
          coverage: layerCount,
        });
      } else if (!sdkMethod) {
        gaps.unwrappedExtrinsics.push(call);
      }
    }

    // Process events
    for (const event of pallet.events) {
      // event is like "Omnipool.TokenAdded"
      const parts = event.split('.');
      const eventName = parts[1] || event;

      coverage.total.events++;

      // Try to find indexer handler
      const patterns = [
        normalize(event),
        normalize(eventName),
        `${normalizedPallet}${normalize(eventName)}`,
      ];

      let handler: string | undefined;
      for (const pattern of patterns) {
        if (indexerEventMap.has(pattern)) {
          handler = indexerEventMap.get(pattern);
          break;
        }
        // Partial match
        for (const [key, value] of indexerEventMap) {
          if (key.includes(normalizedPallet) && key.includes(normalize(eventName))) {
            handler = value;
            break;
          }
        }
        if (handler) break;
      }

      if (handler) {
        coverage.indexed.events++;
        crossRefs.push({
          pallet: pallet.name,
          feature: eventName,
          type: 'event',
          layers: {
            runtime: true,
            indexer: handler,
          },
          coverage: 2,
        });
      } else {
        gaps.unindexedEvents.push(event);
      }
    }
  }

  return { crossRefs, coverage, gaps };
}

function loadLatestExtraction<T>(baseDir: string, layer: string): T | null {
  const layerDir = join(baseDir, layer);
  const latestPath = join(layerDir, 'latest');

  if (!existsSync(latestPath)) {
    // Fallback: try to find any .json file
    return null;
  }

  try {
    const target = readlinkSync(latestPath);
    const fullPath = join(layerDir, target);
    return readJSON<T>(fullPath);
  } catch {
    return null;
  }
}

function buildCrossRefs(
  runtime: RuntimeExtraction,
  sdk: SDKExtraction,
  indexer: IndexerExtraction,
  ui: UIExtraction
): { crossRefs: CrossRef[]; coverage: Coverage; gaps: SynthesisResult['gaps'] } {

  // Build lookup maps
  const sdkTxMap = new Map<string, string>();
  for (const tx of sdk.apiCalls.tx) {
    sdkTxMap.set(normalize(tx.call), tx.call);
  }

  const indexerEventMap = new Map<string, string>();
  for (const h of indexer.handlers) {
    const key = normalize(h.event);
    indexerEventMap.set(key, h.handler);
  }

  const uiTxMap = new Map<string, string>();
  for (const call of ui.sdkUsage) {
    if (call.call.includes('tx.')) {
      uiTxMap.set(normalize(call.call), call.file.split('/').pop() || call.file);
    }
  }

  const crossRefs: CrossRef[] = [];
  const gaps = {
    unindexedEvents: [] as string[],
    unwrappedExtrinsics: [] as string[],
  };

  const coverage: Coverage = {
    total: { extrinsics: 0, events: 0 },
    indexed: { extrinsics: 0, events: 0 },
    sdkWrapped: { extrinsics: 0, events: 0 },
    uiUsed: { extrinsics: 0, events: 0 },
  };

  for (const pallet of runtime.pallets) {
    const normalizedPallet = normalize(pallet.name);

    // Process extrinsics
    for (const ext of pallet.extrinsics) {
      // Skip internal hooks
      if (['on_initialize', 'on_finalize', 'on_idle', 'on_runtime_upgrade'].includes(ext.name)) {
        continue;
      }

      coverage.total.extrinsics++;

      const sdkKey = normalize(`${pallet.name}.${ext.name}`);
      const sdkMethod = sdkTxMap.get(sdkKey);
      const uiComponent = [...uiTxMap.entries()]
        .find(([k]) => k.includes(normalizedPallet) && k.includes(normalize(ext.name)))?.[1];

      if (sdkMethod) coverage.sdkWrapped.extrinsics++;
      if (uiComponent) coverage.uiUsed.extrinsics++;

      const layerCount = 1 + (sdkMethod ? 1 : 0) + (uiComponent ? 1 : 0);

      if (layerCount >= 2) {
        crossRefs.push({
          pallet: pallet.name,
          feature: ext.name,
          type: 'extrinsic',
          layers: {
            runtime: true,
            sdk: sdkMethod,
            ui: uiComponent,
          },
          coverage: layerCount,
        });
      } else if (!sdkMethod) {
        gaps.unwrappedExtrinsics.push(`${pallet.name}.${ext.name}`);
      }
    }

    // Process events
    for (const event of pallet.events) {
      coverage.total.events++;

      // Try multiple patterns for indexer match
      const patterns = [
        normalize(`${pallet.name}.${event.name}`),
        normalize(event.name),
        `${normalizedPallet}${normalize(event.name)}`,
      ];

      let handler: string | undefined;
      for (const pattern of patterns) {
        if (indexerEventMap.has(pattern)) {
          handler = indexerEventMap.get(pattern);
          break;
        }
        // Partial match
        for (const [key, value] of indexerEventMap) {
          if (key.includes(normalizedPallet) && key.includes(normalize(event.name))) {
            handler = value;
            break;
          }
        }
        if (handler) break;
      }

      if (handler) {
        coverage.indexed.events++;
        crossRefs.push({
          pallet: pallet.name,
          feature: event.name,
          type: 'event',
          layers: {
            runtime: true,
            indexer: handler,
          },
          coverage: 2,
        });
      } else {
        gaps.unindexedEvents.push(`${pallet.name}.${event.name}`);
      }
    }
  }

  return { crossRefs, coverage, gaps };
}

function generateOmniscience(result: SynthesisResult): string {
  const { coverage, crossRefs, gaps, commits } = result;

  // Calculate percentages
  const eventCoverage = coverage.total.events > 0
    ? Math.round((coverage.indexed.events / coverage.total.events) * 100)
    : 0;
  const sdkCoverage = coverage.total.extrinsics > 0
    ? Math.round((coverage.sdkWrapped.extrinsics / coverage.total.extrinsics) * 100)
    : 0;

  // Group cross-refs by pallet
  const byPallet = new Map<string, CrossRef[]>();
  for (const ref of crossRefs) {
    if (!byPallet.has(ref.pallet)) byPallet.set(ref.pallet, []);
    byPallet.get(ref.pallet)!.push(ref);
  }

  // ASCII flow diagram
  const flowDiagram = `
## Stack Flow

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│  L1: Runtime                                                │
│  ${coverage.total.extrinsics} extrinsics, ${coverage.total.events} events                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────────────┐
│  L2: SDK        │ │  L3: Indexer│ │                         │
│  ${sdkCoverage}% wrapped    │ │  ${eventCoverage}% indexed │ │                         │
└────────┬────────┘ └─────────────┘ │                         │
         │                          │                         │
         └──────────────────────────┤                         │
                                    ▼                         │
                           ┌─────────────────────────┐        │
                           │  L4: UI                 │        │
                           │  ${crossRefs.filter(r => r.layers.ui).length} features exposed     │        │
                           └─────────────────────────┘        │
\`\`\`
`;

  // Generate compact cross-ref table (only multi-layer connections)
  let crossRefSection = `## Cross-Layer Connections (${crossRefs.length})\n\n`;
  crossRefSection += `| Pallet | Feature | Type | SDK | Indexer | UI |\n`;
  crossRefSection += `|--------|---------|------|-----|---------|----|\n`;

  for (const [pallet, refs] of [...byPallet.entries()].sort()) {
    for (const ref of refs) {
      crossRefSection += `| ${pallet} | ${ref.feature} | ${ref.type} | ${ref.layers.sdk || '-'} | ${ref.layers.indexer || '-'} | ${ref.layers.ui || '-'} |\n`;
    }
  }

  // Full gaps section
  const gapsSection = gaps.unindexedEvents.length > 0 || gaps.unwrappedExtrinsics.length > 0
    ? `## Gaps

### Unindexed Events (${gaps.unindexedEvents.length})

${gaps.unindexedEvents.map(e => `- ${e}`).join('\n')}

### Unwrapped Extrinsics (${gaps.unwrappedExtrinsics.length})

${gaps.unwrappedExtrinsics.map(e => `- ${e}`).join('\n')}
`
    : '';

  return `# OMNISCIENCE: Hydration Stack Map

> Generated: ${result.synthesizedAt}

## Commits
| Layer | Commit |
|-------|--------|
| Runtime | ${commits.runtime.slice(0, 7)} |
| SDK | ${commits.sdk.slice(0, 7)} |
| Indexer | ${commits.indexer.slice(0, 7)} |
| UI | ${commits.ui.slice(0, 7)} |

## Coverage Summary

| Metric | Count | Coverage |
|--------|-------|----------|
| Runtime Extrinsics | ${coverage.total.extrinsics} | - |
| SDK-Wrapped | ${coverage.sdkWrapped.extrinsics} | ${sdkCoverage}% |
| Runtime Events | ${coverage.total.events} | - |
| Indexed Events | ${coverage.indexed.events} | ${eventCoverage}% |
| UI-Exposed Features | ${crossRefs.filter(r => r.layers.ui).length} | - |

${flowDiagram}

${crossRefSection}

${gapsSection}
`;
}

interface SynthesizeOptions {
  extractionsPath: string;
  outputPath: string;
  projectRoot?: string;
}

export async function synthesize(options: SynthesizeOptions): Promise<SynthesisResult> {
  const { extractionsPath, outputPath, projectRoot = process.cwd() } = options;
  log.section('Hydration Codex - Synthesis');
  log.info(`Input: ${extractionsPath}`);
  log.info(`Output: ${outputPath}`);

  // Try to load chain metadata first (source of truth)
  const chainMetaPath = join(extractionsPath, 'metadata/baseline.json');
  const chainMeta = existsSync(chainMetaPath) ? readJSON<ChainMetadata>(chainMetaPath) : null;

  // Load from per-repo structure
  const runtime = loadLatestExtraction<RuntimeExtraction>(extractionsPath, 'runtime')
    || readJSON<RuntimeExtraction>(join(extractionsPath, 'runtime/extraction.json'));
  const sdk = loadLatestExtraction<SDKExtraction>(extractionsPath, 'sdk')
    || readJSON<SDKExtraction>(join(extractionsPath, 'sdk/extraction.json'));
  const indexer = loadLatestExtraction<IndexerExtraction>(extractionsPath, 'indexer')
    || readJSON<IndexerExtraction>(join(extractionsPath, 'indexer/extraction.json'));
  const ui = loadLatestExtraction<UIExtraction>(extractionsPath, 'ui')
    || readJSON<UIExtraction>(join(extractionsPath, 'ui/extraction.json'));

  if (!sdk || !indexer || !ui) {
    throw new Error('Missing extraction files. Run extraction first.');
  }

  if (!chainMeta && !runtime) {
    throw new Error('Missing runtime source. Run extract:chain or extract first.');
  }

  log.section('Building Cross-References');

  // Use chain metadata if available (371 extrinsics vs 16 from grep)
  let crossRefs: CrossRef[];
  let coverage: Coverage;
  let gaps: SynthesisResult['gaps'];

  if (chainMeta) {
    log.info('Using chain metadata as source of truth');
    log.info(`Chain: ${chainMeta.stats.calls} calls, ${chainMeta.stats.events} events`);
    ({ crossRefs, coverage, gaps } = buildCrossRefsFromChain(chainMeta, sdk, indexer, ui));
  } else if (runtime) {
    log.warn('Chain metadata not found, falling back to source extraction');
    ({ crossRefs, coverage, gaps } = buildCrossRefs(runtime, sdk, indexer, ui));
  } else {
    throw new Error('No runtime source available');
  }

  log.success(`Found ${crossRefs.length} cross-layer connections`);
  log.info(`Gaps: ${gaps.unindexedEvents.length} unindexed events, ${gaps.unwrappedExtrinsics.length} unwrapped extrinsics`);

  const result: SynthesisResult = {
    synthesizedAt: new Date().toISOString(),
    commits: {
      runtime: runtime?.meta?.source?.commit || `chain-v${chainMeta?.specVersion || 'unknown'}`,
      sdk: sdk.meta.source.commit,
      indexer: indexer.meta.source.commit,
      ui: ui.meta.source.commit,
    },
    coverage,
    crossRefs,
    gaps,
  };

  // Write compact JSON
  writeJSON(join(outputPath, 'synthesis.json'), result);
  log.success('Wrote synthesis.json');

  // Write single OMNISCIENCE.md (no separate cross-refs.md)
  const omniscience = generateOmniscience(result);
  writeFile(join(outputPath, 'OMNISCIENCE.md'), omniscience);
  log.success('Wrote OMNISCIENCE.md');

  // Also write to agents/contexts for AI consumption (same file, just linked)
  const contextPath = join(projectRoot, 'agents/contexts/OMNISCIENCE.md');
  writeFile(contextPath, omniscience);
  log.success('Wrote agents/contexts/OMNISCIENCE.md');

  log.section('Synthesis Complete');
  log.info(`Coverage: ${Math.round((coverage.indexed.events / coverage.total.events) * 100)}% events indexed`);

  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const extractionsPath = process.env.RAW_PATH || './raw';
  const outputPath = process.env.OUTPUT_PATH || './docs';

  synthesize({ extractionsPath, outputPath }).catch((err) => {
    console.error('Synthesis failed:', err);
    process.exit(1);
  });
}
