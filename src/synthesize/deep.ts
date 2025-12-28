/**
 * Deep Synthesis - Using Chain Metadata as Source of Truth
 *
 * Compares:
 * - L1 Runtime (from chain metadata - THE TRUTH)
 * - L2 SDK (what methods wrap which extrinsics)
 * - L3 Indexer (what events are captured)
 * - L4 UI (what's exposed to users)
 */

import { join } from 'path';
import { createLogger } from '../utils/logger.js';
import { readJSON, writeJSON, writeFile } from '../utils/files.js';

const log = createLogger('deep-synth');

interface PalletMeta {
  name: string;
  index: number;
  storage: { name: string; type: string }[];
  calls: { name: string; args: { name: string; type: string }[] }[];
  events: { name: string; fields: { name: string; type: string }[] }[];
}

interface RuntimeMeta {
  specName: string;
  specVersion: number;
  blockNumber: number;
  pallets: PalletMeta[];
  stats: { palletCount: number; callCount: number; eventCount: number };
}

interface SDKExtraction {
  packages: { name: string }[];
  apiCalls: { tx: { call: string; file: string }[]; query: { call: string }[] };
}

interface IndexerExtraction {
  handlers: { event: string; handler: string }[];
  entities: { name: string }[];
}

interface UIExtraction {
  sdkUsage: { call: string; file: string }[];
  components: { name: string; file: string }[];
}

interface FeatureCoverage {
  pallet: string;
  feature: string;
  type: 'call' | 'event';
  runtime: { name: string; args?: string };
  sdk: { wrapped: boolean; method?: string; file?: string };
  indexer: { captured: boolean; handler?: string };
  ui: { exposed: boolean; component?: string };
  coverage: number; // 1-4
}

interface DeepSynthesis {
  runtimeVersion: { spec: string; version: number; block: number };
  synthesizedAt: string;
  coverage: {
    calls: { total: number; sdkWrapped: number; uiExposed: number };
    events: { total: number; indexed: number };
  };
  features: FeatureCoverage[];
  goldenPaths: GoldenPath[];
}

interface GoldenPath {
  name: string;
  description: string;
  flow: { layer: string; component: string; action: string }[];
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[-_]/g, '');
}

export async function deepSynthesize(options: {
  metadataPath: string;
  extractionsPath: string;
  outputPath: string;
}): Promise<DeepSynthesis> {
  const { metadataPath, extractionsPath, outputPath } = options;

  log.section('Deep Synthesis - Chain Metadata as Truth');

  // Load chain metadata (THE TRUTH)
  const runtime = readJSON<RuntimeMeta>(join(metadataPath, 'metadata.json'));
  if (!runtime) throw new Error('Chain metadata not found. Run extract:metadata first.');

  log.info(`Runtime: ${runtime.specName} v${runtime.specVersion} @ block #${runtime.blockNumber}`);
  log.info(`Pallets: ${runtime.stats.palletCount}, Calls: ${runtime.stats.callCount}, Events: ${runtime.stats.eventCount}`);

  // Load other extractions
  const sdk = readJSON<SDKExtraction>(join(extractionsPath, 'sdk/latest')) ||
              readJSON<SDKExtraction>(join(extractionsPath, 'sdk', getLatestFile(join(extractionsPath, 'sdk'))));
  const indexer = readJSON<IndexerExtraction>(join(extractionsPath, 'indexer/latest')) ||
                  readJSON<IndexerExtraction>(join(extractionsPath, 'indexer', getLatestFile(join(extractionsPath, 'indexer'))));
  const ui = readJSON<UIExtraction>(join(extractionsPath, 'ui/latest')) ||
             readJSON<UIExtraction>(join(extractionsPath, 'ui', getLatestFile(join(extractionsPath, 'ui'))));

  // Build lookup maps
  const sdkTxCalls = new Set<string>();
  const sdkTxMap = new Map<string, { call: string; file: string }>();
  if (sdk?.apiCalls.tx) {
    for (const tx of sdk.apiCalls.tx) {
      const key = normalize(tx.call);
      sdkTxCalls.add(key);
      sdkTxMap.set(key, tx);
    }
  }

  const indexerEvents = new Map<string, string>();
  if (indexer?.handlers) {
    for (const h of indexer.handlers) {
      indexerEvents.set(normalize(h.event), h.handler);
    }
  }

  const uiCalls = new Map<string, string>();
  if (ui?.sdkUsage) {
    for (const usage of ui.sdkUsage) {
      uiCalls.set(normalize(usage.call), usage.file);
    }
  }

  log.section('Analyzing Coverage');

  const features: FeatureCoverage[] = [];
  let totalCalls = 0;
  let sdkWrappedCalls = 0;
  let uiExposedCalls = 0;
  let totalEvents = 0;
  let indexedEvents = 0;

  // Core pallets to focus on
  const corePallets = ['Omnipool', 'Stableswap', 'XYK', 'LBP', 'DCA', 'Router',
    'OmnipoolLiquidityMining', 'CircuitBreaker', 'Staking', 'Bonds', 'OTC',
    'Referrals', 'AssetRegistry', 'Tokens', 'Currencies'];

  for (const pallet of runtime.pallets) {
    const palletNorm = normalize(pallet.name);
    const isCore = corePallets.includes(pallet.name);

    // Analyze calls
    for (const call of pallet.calls) {
      if (call.name.startsWith('__')) continue; // Skip unused
      totalCalls++;

      const callKey = normalize(`${pallet.name}.${call.name}`);
      const sdkMatch = sdkTxMap.get(callKey) ||
                       [...sdkTxMap.entries()].find(([k]) => k.includes(palletNorm) && k.includes(normalize(call.name)))?.[1];
      const uiMatch = [...uiCalls.entries()].find(([k]) => k.includes(palletNorm) && k.includes(normalize(call.name)));

      const wrapped = !!sdkMatch;
      const exposed = !!uiMatch;

      if (wrapped) sdkWrappedCalls++;
      if (exposed) uiExposedCalls++;

      if (isCore) {
        features.push({
          pallet: pallet.name,
          feature: call.name,
          type: 'call',
          runtime: { name: call.name, args: call.args.map(a => `${a.name}: ${a.type}`).join(', ') },
          sdk: { wrapped, method: sdkMatch?.call, file: sdkMatch?.file },
          indexer: { captured: false },
          ui: { exposed, component: uiMatch?.[1] },
          coverage: 1 + (wrapped ? 1 : 0) + (exposed ? 1 : 0),
        });
      }
    }

    // Analyze events
    for (const event of pallet.events) {
      totalEvents++;

      const eventKey = normalize(`${pallet.name}.${event.name}`);
      const handler = indexerEvents.get(eventKey) ||
                      [...indexerEvents.entries()].find(([k]) => k.includes(palletNorm) && k.includes(normalize(event.name)))?.[1];

      if (handler) indexedEvents++;

      if (isCore) {
        features.push({
          pallet: pallet.name,
          feature: event.name,
          type: 'event',
          runtime: { name: event.name, args: event.fields.map(f => `${f.name}: ${f.type}`).join(', ') },
          sdk: { wrapped: false },
          indexer: { captured: !!handler, handler },
          ui: { exposed: false },
          coverage: 1 + (handler ? 1 : 0),
        });
      }
    }
  }

  log.info(`Calls: ${sdkWrappedCalls}/${totalCalls} SDK wrapped (${Math.round(sdkWrappedCalls / totalCalls * 100)}%)`);
  log.info(`Events: ${indexedEvents}/${totalEvents} indexed (${Math.round(indexedEvents / totalEvents * 100)}%)`);

  // Define golden paths (key user journeys)
  const goldenPaths: GoldenPath[] = [
    {
      name: 'Omnipool Swap',
      description: 'User swaps tokens via the Omnipool',
      flow: [
        { layer: 'UI', component: 'TradePage', action: 'User enters swap details' },
        { layer: 'UI', component: 'SwapForm', action: 'Calls SDK router' },
        { layer: 'SDK', component: 'TradeRouter', action: 'Finds optimal route' },
        { layer: 'Runtime', component: 'Router.sell()', action: 'Executes trade' },
        { layer: 'Runtime', component: 'Omnipool.sell()', action: 'Performs swap math' },
        { layer: 'Runtime', component: 'Tokens', action: 'Transfers assets' },
        { layer: 'Runtime', component: 'Broadcast', action: 'Emits Swapped3 event' },
        { layer: 'Indexer', component: 'SwapHandler', action: 'Captures trade data' },
        { layer: 'UI', component: 'TradeHistory', action: 'Displays transaction' },
      ],
    },
    {
      name: 'Add Liquidity',
      description: 'User provides liquidity to Omnipool',
      flow: [
        { layer: 'UI', component: 'LiquidityPage', action: 'User selects asset' },
        { layer: 'SDK', component: 'Omnipool', action: 'Calls add_liquidity' },
        { layer: 'Runtime', component: 'Omnipool.add_liquidity()', action: 'Mints position NFT' },
        { layer: 'Runtime', component: 'Uniques', action: 'Creates NFT' },
        { layer: 'Indexer', component: 'LiquidityHandler', action: 'Records position' },
      ],
    },
    {
      name: 'DCA Schedule',
      description: 'User sets up dollar-cost averaging',
      flow: [
        { layer: 'UI', component: 'DCAPage', action: 'User configures schedule' },
        { layer: 'Runtime', component: 'DCA.schedule()', action: 'Creates DCA order' },
        { layer: 'Runtime', component: 'Scheduler', action: 'Queues execution' },
        { layer: 'Runtime', component: 'DCA.on_initialize()', action: 'Executes trades' },
        { layer: 'Indexer', component: 'DCAHandler', action: 'Tracks executions' },
      ],
    },
  ];

  const result: DeepSynthesis = {
    runtimeVersion: {
      spec: runtime.specName,
      version: runtime.specVersion,
      block: runtime.blockNumber,
    },
    synthesizedAt: new Date().toISOString(),
    coverage: {
      calls: { total: totalCalls, sdkWrapped: sdkWrappedCalls, uiExposed: uiExposedCalls },
      events: { total: totalEvents, indexed: indexedEvents },
    },
    features,
    goldenPaths,
  };

  // Write outputs
  writeJSON(join(outputPath, 'deep-synthesis.json'), result);
  log.success('Wrote deep-synthesis.json');

  const markdown = generateDeepOmniscience(result);
  writeFile(join(outputPath, 'DEEP_OMNISCIENCE.md'), markdown);
  log.success('Wrote DEEP_OMNISCIENCE.md');

  log.section('Deep Synthesis Complete');

  return result;
}

function generateDeepOmniscience(result: DeepSynthesis): string {
  const { runtimeVersion, coverage, features, goldenPaths } = result;

  const callCoverage = Math.round((coverage.calls.sdkWrapped / coverage.calls.total) * 100);
  const eventCoverage = Math.round((coverage.events.indexed / coverage.events.total) * 100);

  let md = `# DEEP OMNISCIENCE: Hydration Protocol Truth Map

> Source of Truth: Chain Metadata @ block #${runtimeVersion.block}
> Spec: ${runtimeVersion.spec} v${runtimeVersion.version}
> Synthesized: ${result.synthesizedAt}

## Coverage Overview

\`\`\`
┌────────────────────────────────────────────────────────────────────┐
│  L1: RUNTIME (Source of Truth)                                     │
│  ${coverage.calls.total} extrinsics, ${coverage.events.total} events                                    │
└────────────────────────────┬───────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
┌───────────────────┐ ┌──────────────┐ ┌────────────────────────────┐
│  L2: SDK          │ │  L3: INDEXER │ │  L4: UI                    │
│  ${callCoverage}% wrapped      │ │  ${eventCoverage}% indexed  │ │  ${Math.round((coverage.calls.uiExposed / coverage.calls.total) * 100)}% exposed                │
│  (${coverage.calls.sdkWrapped}/${coverage.calls.total} calls)    │ │  (${coverage.events.indexed}/${coverage.events.total} events)│ │                            │
└───────────────────┘ └──────────────┘ └────────────────────────────┘
\`\`\`

## Golden Paths (Key User Journeys)

`;

  for (const path of goldenPaths) {
    md += `### ${path.name}\n\n`;
    md += `> ${path.description}\n\n`;
    md += `\`\`\`mermaid\nflowchart LR\n`;
    for (let i = 0; i < path.flow.length; i++) {
      const step = path.flow[i];
      const nodeId = `step${i}`;
      const shape = step.layer === 'Runtime' ? `[["${step.component}"]]` :
                    step.layer === 'Indexer' ? `[("${step.component}")]` :
                    `["${step.component}"]`;
      md += `    ${nodeId}${shape}\n`;
      if (i > 0) {
        md += `    step${i - 1} --> ${nodeId}\n`;
      }
    }
    md += `\`\`\`\n\n`;
  }

  // Group features by pallet
  const byPallet = new Map<string, FeatureCoverage[]>();
  for (const f of features) {
    if (!byPallet.has(f.pallet)) byPallet.set(f.pallet, []);
    byPallet.get(f.pallet)!.push(f);
  }

  md += `## Feature Coverage by Pallet\n\n`;

  for (const [pallet, feats] of [...byPallet.entries()].sort()) {
    const calls = feats.filter(f => f.type === 'call');
    const events = feats.filter(f => f.type === 'event');
    const wrapped = calls.filter(c => c.sdk.wrapped).length;
    const indexed = events.filter(e => e.indexer.captured).length;

    md += `### ${pallet}\n\n`;
    md += `| Type | Total | Covered | Coverage |\n`;
    md += `|------|-------|---------|----------|\n`;
    md += `| Calls | ${calls.length} | ${wrapped} SDK | ${calls.length > 0 ? Math.round(wrapped / calls.length * 100) : 0}% |\n`;
    md += `| Events | ${events.length} | ${indexed} indexed | ${events.length > 0 ? Math.round(indexed / events.length * 100) : 0}% |\n\n`;

    if (calls.length > 0) {
      md += `**Calls:**\n`;
      md += `| Call | Args | SDK | UI |\n`;
      md += `|------|------|-----|----|\n`;
      for (const c of calls) {
        md += `| ${c.feature} | \`${c.runtime.args || 'none'}\` | ${c.sdk.wrapped ? '✓' : '-'} | ${c.ui.exposed ? '✓' : '-'} |\n`;
      }
      md += '\n';
    }

    if (events.length > 0) {
      md += `**Events:**\n`;
      md += `| Event | Fields | Indexed |\n`;
      md += `|-------|--------|---------|`;
      for (const e of events) {
        md += `\n| ${e.feature} | \`${e.runtime.args || 'none'}\` | ${e.indexer.captured ? '✓' : '-'} |`;
      }
      md += '\n\n';
    }
  }

  return md;
}

function getLatestFile(_dir: string): string {
  // Simplified - just return default since we use symlinks
  return 'extraction.json';
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const metadataPath = process.env.METADATA_PATH || './raw/metadata';
  const extractionsPath = process.env.RAW_PATH || './raw';
  const outputPath = process.env.OUTPUT_PATH || './docs';

  deepSynthesize({ metadataPath, extractionsPath, outputPath })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Deep synthesis failed:', err);
      process.exit(1);
    });
}
