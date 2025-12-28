/**
 * Flow Generation - Auto-generate Mermaid flowcharts from extraction data
 *
 * Generates feature-based flows organized by entry point:
 * - from-ui/: L4 → L2 → L1 flows (user feature journeys)
 * - from-sdk/: L2 → L1 flows (SDK method call traces)
 * - from-runtime/: L1 → L3 flows (event to indexer traces)
 */

import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'fs';
import { createLogger } from '../utils/logger.js';
import { readJSON } from '../utils/files.js';
import type { SDKExtraction, IndexerExtraction, UIExtraction } from '../schemas/extraction.js';

const log = createLogger('flows');

// Chain metadata structure (simplified)
interface ChainMetadata {
  pallets: Array<{
    name: string;
    calls: string[];
    events: string[];
  }>;
}

// Feature domains for grouping UI flows
const UI_FEATURE_DOMAINS: Record<string, { patterns: string[]; label: string }> = {
  'swap': {
    patterns: ['swap', 'trade', 'router', 'exchange'],
    label: 'Swap/Trading',
  },
  'liquidity': {
    patterns: ['liquidity', 'pool', 'omnipool', 'xyk', 'stableswap', 'lbp'],
    label: 'Liquidity',
  },
  'dca': {
    patterns: ['dca', 'schedule', 'order'],
    label: 'DCA Orders',
  },
  'staking': {
    patterns: ['staking', 'stake', 'unstake', 'claim'],
    label: 'Staking',
  },
  'governance': {
    patterns: ['democracy', 'referendum', 'vote', 'conviction', 'referenda'],
    label: 'Governance',
  },
  'xcm': {
    patterns: ['xcm', 'transfer', 'bridge', 'cross'],
    label: 'Cross-Chain',
  },
  'evm': {
    patterns: ['evm', 'ethereum', 'metamask', 'borrow', 'lend', 'money'],
    label: 'EVM/Lending',
  },
  'otc': {
    patterns: ['otc', 'settlement'],
    label: 'OTC Trading',
  },
};

interface FlowOptions {
  extractionsPath: string;
  outputPath: string;
}

export async function synthesizeFlows(options: FlowOptions): Promise<void> {
  const { extractionsPath, outputPath } = options;

  log.section('Flow Generation from Extraction Data');

  // Load extractions
  const sdk = loadLatestExtraction<SDKExtraction>(extractionsPath, 'sdk');
  const indexer = loadLatestExtraction<IndexerExtraction>(extractionsPath, 'indexer');
  const ui = loadLatestExtraction<UIExtraction>(extractionsPath, 'ui');

  // Load chain metadata
  const chainMetaPath = join(extractionsPath, 'metadata/baseline.json');
  const chainMeta = existsSync(chainMetaPath) ? readJSON<ChainMetadata>(chainMetaPath) : null;

  if (!sdk || !ui) {
    throw new Error('Missing required extractions (SDK, UI). Run npm run extract first.');
  }

  // Create output directories
  const flowsPath = join(outputPath, 'flows');
  const fromUiPath = join(flowsPath, 'from-ui');
  const fromSdkPath = join(flowsPath, 'from-sdk');
  const fromRuntimePath = join(flowsPath, 'from-runtime');

  mkdirSync(fromUiPath, { recursive: true });
  mkdirSync(fromSdkPath, { recursive: true });
  mkdirSync(fromRuntimePath, { recursive: true });

  // Generate from-ui flows
  log.section('Generating From-UI Flows (L4 → L1)');
  const uiFlows = generateFromUiFlows(ui, sdk);
  for (const [name, content] of Object.entries(uiFlows)) {
    const filePath = join(fromUiPath, `${name}.mmd`);
    writeFileSync(filePath, content);
    log.info(`Generated ${name}.mmd`);
  }
  log.success(`Generated ${Object.keys(uiFlows).length} UI flows`);

  // Generate from-sdk flows
  log.section('Generating From-SDK Flows (L2 → L1)');
  const sdkFlows = generateFromSdkFlows(sdk);
  for (const [name, content] of Object.entries(sdkFlows)) {
    const filePath = join(fromSdkPath, `${name}.mmd`);
    writeFileSync(filePath, content);
    log.info(`Generated ${name}.mmd`);
  }
  log.success(`Generated ${Object.keys(sdkFlows).length} SDK flows`);

  // Generate from-runtime flows
  if (indexer && chainMeta) {
    log.section('Generating From-Runtime Flows (L1 → L3)');
    const runtimeFlows = generateFromRuntimeFlows(chainMeta, indexer);
    for (const [name, content] of Object.entries(runtimeFlows)) {
      const filePath = join(fromRuntimePath, `${name}.mmd`);
      writeFileSync(filePath, content);
      log.info(`Generated ${name}.mmd`);
    }
    log.success(`Generated ${Object.keys(runtimeFlows).length} runtime flows`);
  } else {
    log.warn('Skipping runtime flows (missing indexer or chain metadata)');
  }

  // Generate per-hook diagrams (small, focused diagrams for each hook)
  log.section('Generating Per-Hook Diagrams');
  const hooksPath = join(flowsPath, 'hooks');
  const hookStats = generatePerHookDiagrams(ui, sdk, indexer, hooksPath);
  log.success(`Generated ${hookStats.total} hook diagrams in ${hookStats.areas} areas`);

  // Generate hook index/matrix
  const hookIndex = generateHookIndex(ui, hooksPath);
  writeFileSync(join(hooksPath, 'INDEX.md'), hookIndex);
  log.info('Generated hooks/INDEX.md');

  // Generate index file
  generateFlowsIndex(flowsPath, Object.keys(uiFlows), Object.keys(sdkFlows), []);

  log.section('Flow Generation Complete');
  console.log(`\n  Output: ${flowsPath}/\n`);
}

function loadLatestExtraction<T>(baseDir: string, layer: string): T | null {
  const layerDir = join(baseDir, layer);
  if (!existsSync(layerDir)) return null;

  const files = readdirSync(layerDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) return null;

  // Prefer 'extraction.json' if it exists (standard output name)
  if (files.includes('extraction.json')) {
    return readJSON<T>(join(layerDir, 'extraction.json'));
  }

  // Otherwise, sort by modification time (newest first)
  const sortedFiles = files.sort((a, b) => {
    const statA = statSync(join(layerDir, a));
    const statB = statSync(join(layerDir, b));
    return statB.mtime.getTime() - statA.mtime.getTime();
  });

  return readJSON<T>(join(layerDir, sortedFiles[0]));
}

/**
 * Generate UI → SDK → Runtime flows grouped by feature domain
 */
function generateFromUiFlows(
  ui: UIExtraction,
  sdk: SDKExtraction
): Record<string, string> {
  const flows: Record<string, string> = {};

  // Group UI usage by domain
  const domainUsage: Record<string, {
    hooks: Map<string, { file: string; line: number }>;
    queries: Map<string, { file: string; line: number }>;
    txCalls: Map<string, { file: string; line: number }>;
  }> = {};

  // Initialize domains
  for (const domain of Object.keys(UI_FEATURE_DOMAINS)) {
    domainUsage[domain] = {
      hooks: new Map(),
      queries: new Map(),
      txCalls: new Map(),
    };
  }
  domainUsage['other'] = { hooks: new Map(), queries: new Map(), txCalls: new Map() };

  // Classify hooks by domain
  for (const hook of ui.hooks) {
    const domain = classifyByDomain(hook.name, hook.file);
    domainUsage[domain].hooks.set(hook.name, { file: hook.file, line: hook.line });
  }

  // Classify SDK usage (queries and tx calls)
  for (const usage of ui.sdkUsage) {
    const domain = classifyByDomain(usage.call, usage.file);
    if (usage.call.startsWith('tx.')) {
      domainUsage[domain].txCalls.set(usage.call, { file: usage.file, line: usage.line });
    } else if (usage.call.startsWith('query.')) {
      domainUsage[domain].queries.set(usage.call, { file: usage.file, line: usage.line });
    }
  }

  // Generate flow for each domain with activity
  for (const [domain, usage] of Object.entries(domainUsage)) {
    if (usage.txCalls.size === 0 && usage.queries.size === 0 && usage.hooks.size === 0) continue;

    const config = UI_FEATURE_DOMAINS[domain] || { label: 'Other', patterns: [] };
    flows[domain] = generateUiDomainFlow(domain, config.label, usage);
  }

  return flows;
}

function classifyByDomain(name: string, file: string): string {
  const combined = `${name} ${file}`.toLowerCase();

  for (const [domain, config] of Object.entries(UI_FEATURE_DOMAINS)) {
    if (config.patterns.some(p => combined.includes(p))) {
      return domain;
    }
  }
  return 'other';
}

function generateUiDomainFlow(
  domain: string,
  label: string,
  usage: {
    hooks: Map<string, { file: string; line: number }>;
    queries: Map<string, { file: string; line: number }>;
    txCalls: Map<string, { file: string; line: number }>;
  }
): string {
  const lines: string[] = [
    'flowchart TD',
    `    %% ${label} Flow: L4 → L2 → L1`,
    `    %% Auto-generated from extraction data`,
    '',
  ];

  // L4 subgraph - UI hooks
  const hooksArray = Array.from(usage.hooks.entries()).slice(0, 10);
  if (hooksArray.length > 0) {
    lines.push(`    subgraph L4["🖥️ L4: UI - ${label}"]`);
    for (const [name, info] of hooksArray) {
      const nodeId = sanitizeId(`hook_${name}`);
      const shortFile = info.file.split('/').slice(-2).join('/');
      lines.push(`        ${nodeId}["${name}()<br/><small>${shortFile}:${info.line}</small>"]`);
    }
    if (usage.hooks.size > 10) {
      lines.push(`        more_hooks["... +${usage.hooks.size - 10} more hooks"]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // L2 subgraph - SDK/API calls grouped by pallet
  const queryGroups = groupByPallet(Array.from(usage.queries.keys()));
  const txGroups = groupByPallet(Array.from(usage.txCalls.keys()));

  if (queryGroups.size > 0 || txGroups.size > 0) {
    lines.push(`    subgraph L2["📦 L2: API Calls"]`);

    // Add queries grouped by pallet
    if (queryGroups.size > 0) {
      lines.push(`        subgraph Queries["Query Calls"]`);
      for (const [pallet, calls] of queryGroups) {
        for (const call of calls.slice(0, 4)) {
          const nodeId = sanitizeId(`q_${call}`);
          const shortCall = call.replace('query.', '');
          lines.push(`            ${nodeId}["${shortCall}"]`);
        }
        if (calls.length > 4) {
          lines.push(`            q_more_${sanitizeId(pallet)}["... +${calls.length - 4} more ${pallet}"]`);
        }
      }
      lines.push('        end');
    }

    // Add tx calls grouped by pallet
    if (txGroups.size > 0) {
      lines.push(`        subgraph Transactions["Transaction Calls"]`);
      for (const [pallet, calls] of txGroups) {
        for (const call of calls.slice(0, 4)) {
          const nodeId = sanitizeId(`tx_${call}`);
          const shortCall = call.replace('tx.', '');
          lines.push(`            ${nodeId}["${shortCall}"]`);
        }
        if (calls.length > 4) {
          lines.push(`            tx_more_${sanitizeId(pallet)}["... +${calls.length - 4} more ${pallet}"]`);
        }
      }
      lines.push('        end');
    }

    lines.push('    end');
    lines.push('');
  }

  // L1 subgraph - Runtime pallets
  const allPallets = new Set([...queryGroups.keys(), ...txGroups.keys()]);
  if (allPallets.size > 0) {
    lines.push(`    subgraph L1["⚙️ L1: Runtime Pallets"]`);
    for (const pallet of allPallets) {
      const nodeId = sanitizeId(`pallet_${pallet}`);
      lines.push(`        ${nodeId}[["${pallet}"]]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // Connections
  lines.push('    %% Connections');

  // Hooks → Queries/Tx
  if (hooksArray.length > 0) {
    const [firstHookName] = hooksArray[0];
    const firstHookId = sanitizeId(`hook_${firstHookName}`);

    if (queryGroups.size > 0) {
      const firstQuery = Array.from(queryGroups.values())[0][0];
      lines.push(`    ${firstHookId} --> |"queries"| ${sanitizeId(`q_${firstQuery}`)}`);
    }
    if (txGroups.size > 0) {
      const firstTx = Array.from(txGroups.values())[0][0];
      lines.push(`    ${firstHookId} --> |"submits"| ${sanitizeId(`tx_${firstTx}`)}`);
    }
  }

  // Queries → Pallets (dashed)
  for (const [pallet, calls] of queryGroups) {
    const palletId = sanitizeId(`pallet_${pallet}`);
    const queryId = sanitizeId(`q_${calls[0]}`);
    lines.push(`    ${queryId} -.-> ${palletId}`);
  }

  // Tx → Pallets (solid)
  for (const [pallet, calls] of txGroups) {
    const palletId = sanitizeId(`pallet_${pallet}`);
    const txId = sanitizeId(`tx_${calls[0]}`);
    lines.push(`    ${txId} --> ${palletId}`);
  }

  // Styling
  lines.push('');
  lines.push('    %% Styling');
  lines.push('    style L4 fill:#f0f9ff,stroke:#0ea5e9');
  lines.push('    style L2 fill:#fef3c7,stroke:#f59e0b');
  lines.push('    style L1 fill:#f0fdf4,stroke:#22c55e');

  return lines.join('\n');
}

function groupByPallet(calls: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();

  for (const call of calls) {
    // Parse "query.Pallet.method" or "tx.Pallet.method"
    const parts = call.split('.');
    if (parts.length >= 2) {
      const pallet = parts[1];
      if (!groups.has(pallet)) groups.set(pallet, []);
      if (!groups.get(pallet)!.includes(call)) {
        groups.get(pallet)!.push(call);
      }
    }
  }

  return groups;
}

/**
 * Generate SDK → Runtime flows by SDK class/file
 */
function generateFromSdkFlows(sdk: SDKExtraction): Record<string, string> {
  const flows: Record<string, string> = {};

  // Group SDK tx calls by file/class
  const fileGroups = new Map<string, { file: string; tx: string[]; query: string[] }>();

  for (const tx of sdk.apiCalls.tx) {
    const key = extractClassFromFile(tx.file);
    if (!fileGroups.has(key)) fileGroups.set(key, { file: tx.file, tx: [], query: [] });
    if (!fileGroups.get(key)!.tx.includes(tx.call)) {
      fileGroups.get(key)!.tx.push(tx.call);
    }
  }

  for (const query of sdk.apiCalls.query) {
    const key = extractClassFromFile(query.file);
    if (!fileGroups.has(key)) fileGroups.set(key, { file: query.file, tx: [], query: [] });
    if (!fileGroups.get(key)!.query.includes(query.call)) {
      fileGroups.get(key)!.query.push(query.call);
    }
  }

  // Generate flows for significant classes (at least 2 calls)
  for (const [className, data] of fileGroups) {
    if (data.tx.length < 2 && data.query.length < 2) continue;

    const flowName = className.toLowerCase().replace(/[^a-z0-9]/g, '-');
    flows[flowName] = generateSdkClassFlow(className, data);
  }

  return flows;
}

function extractClassFromFile(file: string): string {
  const parts = file.split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace(/\.(ts|js)$/, '');
}

function generateSdkClassFlow(
  className: string,
  data: { file: string; tx: string[]; query: string[] }
): string {
  const lines: string[] = [
    'flowchart TD',
    `    %% SDK ${className} → Runtime Flow`,
    `    %% Source: ${data.file}`,
    `    %% Auto-generated from extraction data`,
    '',
  ];

  // L2 subgraph
  lines.push(`    subgraph L2["📦 L2: SDK - ${className}"]`);
  lines.push(`        class_entry(["${className}"])`);

  if (data.tx.length > 0) {
    lines.push(`        subgraph TxMethods["Transactions"]`);
    for (const tx of data.tx.slice(0, 8)) {
      const nodeId = sanitizeId(`sdk_tx_${tx}`);
      lines.push(`            ${nodeId}["${formatCallName(tx)}"]`);
    }
    if (data.tx.length > 8) {
      lines.push(`            sdk_more_tx["... +${data.tx.length - 8} more"]`);
    }
    lines.push('        end');
  }

  if (data.query.length > 0) {
    lines.push(`        subgraph QueryMethods["Queries"]`);
    for (const query of data.query.slice(0, 8)) {
      const nodeId = sanitizeId(`sdk_q_${query}`);
      lines.push(`            ${nodeId}["${formatCallName(query)}"]`);
    }
    if (data.query.length > 8) {
      lines.push(`            sdk_more_q["... +${data.query.length - 8} more"]`);
    }
    lines.push('        end');
  }

  lines.push('    end');
  lines.push('');

  // L1 subgraph - Extract pallets from calls
  const txPallets = extractPalletsFromCalls(data.tx);
  const queryPallets = extractPalletsFromCalls(data.query);
  const allPallets = new Set([...txPallets, ...queryPallets]);

  if (allPallets.size > 0) {
    lines.push(`    subgraph L1["⚙️ L1: Runtime"]`);
    for (const pallet of allPallets) {
      const nodeId = sanitizeId(`pallet_${pallet}`);
      lines.push(`        ${nodeId}[["${pallet}"]]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // Connections
  lines.push('    %% Connections');
  if (data.tx.length > 0) {
    lines.push('    class_entry --> TxMethods');
  }
  if (data.query.length > 0) {
    lines.push('    class_entry --> QueryMethods');
  }

  // Tx → Pallets
  for (const tx of data.tx.slice(0, 6)) {
    const pallet = extractPalletFromCall(tx);
    if (pallet) {
      const txId = sanitizeId(`sdk_tx_${tx}`);
      const palletId = sanitizeId(`pallet_${pallet}`);
      lines.push(`    ${txId} --> ${palletId}`);
    }
  }

  // Query → Pallets (dashed)
  for (const query of data.query.slice(0, 6)) {
    const pallet = extractPalletFromCall(query);
    if (pallet) {
      const queryId = sanitizeId(`sdk_q_${query}`);
      const palletId = sanitizeId(`pallet_${pallet}`);
      lines.push(`    ${queryId} -.-> ${palletId}`);
    }
  }

  // Styling
  lines.push('');
  lines.push('    %% Styling');
  lines.push('    style L2 fill:#fef3c7,stroke:#f59e0b');
  lines.push('    style L1 fill:#f0fdf4,stroke:#22c55e');

  return lines.join('\n');
}

function extractPalletsFromCalls(calls: string[]): Set<string> {
  const pallets = new Set<string>();
  for (const call of calls) {
    const pallet = extractPalletFromCall(call);
    if (pallet) pallets.add(pallet);
  }
  return pallets;
}

function extractPalletFromCall(call: string): string | null {
  // Handles "pallet.method", "Pallet.method"
  const parts = call.split('.');
  if (parts.length >= 2) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  return null;
}

function formatCallName(call: string): string {
  const parts = call.split('.');
  if (parts.length === 2) {
    return `${parts[0]}.${parts[1]}()`;
  }
  return call;
}

/**
 * Generate Runtime Event → Indexer flows grouped by category
 */
function generateFromRuntimeFlows(
  chainMeta: ChainMetadata,
  indexer: IndexerExtraction
): Record<string, string> {
  const flows: Record<string, string> = {};

  // Build indexed events lookup (normalized)
  const indexedEvents = new Map<string, { handler: string; file: string; entities: string[] }>();
  for (const handler of indexer.handlers) {
    const normalizedEvent = handler.event.toLowerCase().replace(/[^a-z0-9]/g, '');
    indexedEvents.set(normalizedEvent, {
      handler: handler.handler,
      file: handler.file,
      entities: handler.createsEntities,
    });
  }

  // Group pallets by category
  const palletCategories: Record<string, string[]> = {
    'trading': ['Router', 'Omnipool', 'XYK', 'Stableswap', 'LBP'],
    'dca': ['DCA'],
    'liquidity-mining': ['OmnipoolLiquidityMining', 'XYKLiquidityMining', 'OmnipoolWarehouseLM', 'XYKWarehouseLM'],
    'staking': ['Staking'],
    'governance': ['Democracy', 'Referenda', 'ConvictionVoting', 'Treasury'],
    'assets': ['Tokens', 'Balances', 'AssetRegistry', 'Currencies'],
    'otc': ['OTC', 'OtcSettlements'],
  };

  for (const [category, palletNames] of Object.entries(palletCategories)) {
    const categoryEvents: Array<{
      pallet: string;
      event: string;
      handler?: { name: string; file: string };
    }> = [];

    for (const pallet of chainMeta.pallets) {
      if (!palletNames.some(p => pallet.name.toLowerCase().includes(p.toLowerCase()))) continue;

      for (const event of pallet.events) {
        const eventName = event.includes('.') ? event.split('.')[1] : event;
        const normalizedSearch = `${pallet.name}${eventName}`.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Try to find matching handler
        let matchedHandler: { name: string; file: string } | undefined;
        for (const [key, value] of indexedEvents) {
          if (key.includes(eventName.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
            matchedHandler = { name: value.handler, file: value.file };
            break;
          }
        }

        categoryEvents.push({
          pallet: pallet.name,
          event: eventName,
          handler: matchedHandler,
        });
      }
    }

    if (categoryEvents.length > 0) {
      flows[category] = generateRuntimeCategoryFlow(category, categoryEvents, indexer);
    }
  }

  return flows;
}

function generateRuntimeCategoryFlow(
  category: string,
  events: Array<{ pallet: string; event: string; handler?: { name: string; file: string } }>,
  indexer: IndexerExtraction
): string {
  const lines: string[] = [
    'flowchart TD',
    `    %% ${category.toUpperCase()} Events → Indexer Flow`,
    `    %% Auto-generated from extraction data`,
    '',
  ];

  // Group events by pallet
  const palletEvents = new Map<string, typeof events>();
  for (const e of events) {
    if (!palletEvents.has(e.pallet)) palletEvents.set(e.pallet, []);
    palletEvents.get(e.pallet)!.push(e);
  }

  // L1 subgraph
  lines.push(`    subgraph L1["⚙️ L1: Runtime - ${category}"]`);
  for (const [pallet, palletEvts] of palletEvents) {
    const palletId = sanitizeId(`pallet_${pallet}`);
    lines.push(`        subgraph ${palletId}["${pallet}"]`);
    for (const evt of palletEvts.slice(0, 6)) {
      const nodeId = sanitizeId(`evt_${pallet}_${evt.event}`);
      const indexed = evt.handler ? '✓' : '';
      lines.push(`            ${nodeId}["${evt.event} ${indexed}"]`);
    }
    if (palletEvts.length > 6) {
      lines.push(`            ${palletId}_more["... +${palletEvts.length - 6} more"]`);
    }
    lines.push('        end');
  }
  lines.push('    end');
  lines.push('');

  // Collect handlers and entities for this category
  const handlers = new Map<string, string>();
  const entities = new Set<string>();

  for (const evt of events) {
    if (evt.handler) {
      handlers.set(evt.handler.name, evt.handler.file);
    }
  }

  // Get related entities from indexer schema
  const relatedEntityNames = ['Trade', 'Swap', 'Pool', 'Position', 'Account', 'Asset', 'LiquidityChange', 'DCA', 'Staking'];
  for (const entity of indexer.schema.entities) {
    if (relatedEntityNames.some(re => entity.name.includes(re))) {
      entities.add(entity.name);
    }
  }

  // L3 subgraph
  lines.push(`    subgraph L3["🗄️ L3: Indexer"]`);

  if (handlers.size > 0) {
    lines.push(`        subgraph Handlers["Event Handlers"]`);
    let handlerCount = 0;
    for (const [name, file] of handlers) {
      if (handlerCount >= 8) {
        lines.push(`            handlers_more["... +${handlers.size - 8} more"]`);
        break;
      }
      const nodeId = sanitizeId(`handler_${name}`);
      const shortFile = file.split('/').slice(-2).join('/');
      lines.push(`            ${nodeId}["${name}()<br/><small>${shortFile}</small>"]`);
      handlerCount++;
    }
    lines.push('        end');
  }

  if (entities.size > 0) {
    lines.push(`        subgraph Entities["Stored Entities"]`);
    const entityArray = Array.from(entities).slice(0, 6);
    for (const entity of entityArray) {
      const nodeId = sanitizeId(`entity_${entity}`);
      lines.push(`            ${nodeId}[("${entity}")]`);
    }
    if (entities.size > 6) {
      lines.push(`            entities_more["... +${entities.size - 6} more"]`);
    }
    lines.push('        end');
  }

  lines.push('    end');
  lines.push('');

  // Connections: Events → Handlers
  lines.push('    %% Connections');
  for (const evt of events.filter(e => e.handler).slice(0, 8)) {
    const evtId = sanitizeId(`evt_${evt.pallet}_${evt.event}`);
    const handlerId = sanitizeId(`handler_${evt.handler!.name}`);
    lines.push(`    ${evtId} --> ${handlerId}`);
  }

  // Handlers → Entities (simplified)
  if (handlers.size > 0 && entities.size > 0) {
    const firstHandler = sanitizeId(`handler_${Array.from(handlers.keys())[0]}`);
    const firstEntity = sanitizeId(`entity_${Array.from(entities)[0]}`);
    lines.push(`    ${firstHandler} --> ${firstEntity}`);
  }

  // Coverage stats
  const indexed = events.filter(e => e.handler).length;
  const total = events.length;
  lines.push('');
  lines.push(`    %% Coverage: ${indexed}/${total} events have handlers`);

  // Styling
  lines.push('');
  lines.push('    %% Styling');
  lines.push('    style L1 fill:#f0fdf4,stroke:#22c55e');
  lines.push('    style L3 fill:#fff1f2,stroke:#f43f5e');

  return lines.join('\n');
}

/**
 * Generate UI data source diagrams showing where each hook gets its data
 */
function generateDataSourceFlows(ui: UIExtraction): Record<string, string> {
  const flows: Record<string, string> = {};

  // Build lookup of calls by FEATURE AREA (not individual file)
  // This is the key fix - we group all calls in staking/ together
  const callsByArea = new Map<string, {
    l1Direct: string[];      // papi.query.*
    l2Sdk: string[];         // sdk.api.*, sdk.client.*
    l1Legacy: string[];      // query.*
    l3Indexer: string[];     // indexerSdk.*, indexer.*Query
  }>();

  // Also keep file-level for the diagram generation
  const callsByFile = new Map<string, {
    l1Direct: string[];
    l2Sdk: string[];
    l1Legacy: string[];
    l3Indexer: string[];
  }>();

  // Process SDK usage - group by feature area AND by file
  for (const usage of ui.sdkUsage) {
    const area = extractFeatureArea(usage.file);

    // Initialize area if needed
    if (!callsByArea.has(area)) {
      callsByArea.set(area, { l1Direct: [], l2Sdk: [], l1Legacy: [], l3Indexer: [] });
    }
    const areaEntry = callsByArea.get(area)!;

    // Initialize file if needed
    if (!callsByFile.has(usage.file)) {
      callsByFile.set(usage.file, { l1Direct: [], l2Sdk: [], l1Legacy: [], l3Indexer: [] });
    }
    const fileEntry = callsByFile.get(usage.file)!;

    // Categorize the call
    if (usage.call.startsWith('papi.query.')) {
      if (!areaEntry.l1Direct.includes(usage.call)) areaEntry.l1Direct.push(usage.call);
      if (!fileEntry.l1Direct.includes(usage.call)) fileEntry.l1Direct.push(usage.call);
    } else if (usage.call.startsWith('sdk.api.') || usage.call.startsWith('sdk.client.')) {
      if (!areaEntry.l2Sdk.includes(usage.call)) areaEntry.l2Sdk.push(usage.call);
      if (!fileEntry.l2Sdk.includes(usage.call)) fileEntry.l2Sdk.push(usage.call);
    } else if (usage.call.startsWith('query.')) {
      if (!areaEntry.l1Legacy.includes(usage.call)) areaEntry.l1Legacy.push(usage.call);
      if (!fileEntry.l1Legacy.includes(usage.call)) fileEntry.l1Legacy.push(usage.call);
    }
  }

  // Process indexer usage - group by feature area
  for (const usage of ui.indexerUsage) {
    const area = extractFeatureArea(usage.file);

    if (!callsByArea.has(area)) {
      callsByArea.set(area, { l1Direct: [], l2Sdk: [], l1Legacy: [], l3Indexer: [] });
    }
    const areaEntry = callsByArea.get(area)!;

    if (!callsByFile.has(usage.file)) {
      callsByFile.set(usage.file, { l1Direct: [], l2Sdk: [], l1Legacy: [], l3Indexer: [] });
    }
    const fileEntry = callsByFile.get(usage.file)!;

    // Only add specific indexer calls, not generic useQuery
    if (usage.query.startsWith('indexerSdk.') || usage.query.startsWith('indexer.') || usage.query.startsWith('squidSdk.')) {
      if (!areaEntry.l3Indexer.includes(usage.query)) areaEntry.l3Indexer.push(usage.query);
      if (!fileEntry.l3Indexer.includes(usage.query)) fileEntry.l3Indexer.push(usage.query);
    }
  }

  // Group hooks by feature area
  const hooksByArea = new Map<string, Array<{
    name: string;
    file: string;
    line: number;
    usesSDK: boolean;
    usesIndexer: boolean;
  }>>();

  for (const hook of ui.hooks) {
    const area = extractFeatureArea(hook.file);
    if (!hooksByArea.has(area)) hooksByArea.set(area, []);
    hooksByArea.get(area)!.push(hook);
  }

  // Generate diagram for each area with hooks
  for (const [area, hooks] of hooksByArea) {
    if (hooks.length < 2) continue;

    // Get all calls for this ENTIRE AREA (not per-hook)
    const areaCallsData = callsByArea.get(area);

    // Build hook → calls mapping using area-level data
    // Each hook in the area gets linked to the area's calls
    const hookToCalls = new Map<string, { l1Direct: string[]; l2Sdk: string[]; l1Legacy: string[]; l3Indexer: string[] }>();

    if (areaCallsData && (areaCallsData.l1Direct.length > 0 || areaCallsData.l1Legacy.length > 0 ||
        areaCallsData.l2Sdk.length > 0 || areaCallsData.l3Indexer.length > 0)) {

      // For each hook that indicates it uses SDK or indexer, link it to area calls
      for (const hook of hooks) {
        const hookCalls = {
          l1Direct: [...areaCallsData.l1Direct, ...areaCallsData.l1Legacy],
          l2Sdk: [...areaCallsData.l2Sdk],
          l1Legacy: [],
          l3Indexer: [...areaCallsData.l3Indexer],
        };

        // Only add if hook actually uses something (based on usesSDK/usesIndexer flags)
        if ((hook.usesSDK && (hookCalls.l1Direct.length > 0 || hookCalls.l2Sdk.length > 0)) ||
            (hook.usesIndexer && hookCalls.l3Indexer.length > 0)) {
          hookToCalls.set(hook.name, hookCalls);
        }
      }
    }

    flows[area] = generateDataSourceDiagram(area, hooks, hookToCalls, callsByFile);
  }

  // Also generate an overview diagram
  flows['overview'] = generateDataSourceOverview(ui, callsByFile);

  return flows;
}

function extractFeatureArea(file: string): string {
  const fileLower = file.toLowerCase();
  // Extract just the filename for additional matching
  const fileName = fileLower.split('/').pop() || '';

  // Check for feature-specific directories AND filenames
  // Check specific features BEFORE generic /api/ to catch api/staking.ts as 'staking'
  if (fileLower.includes('/staking/') || fileName.includes('staking')) return 'staking';
  if (fileLower.includes('/trade/') || fileLower.includes('/swap/') || fileName.includes('swap') || fileName.includes('trade')) return 'trading';
  if (fileLower.includes('/liquidity/') || fileLower.includes('/pool') || fileName.includes('pool')) return 'liquidity';
  if (fileLower.includes('/borrow/') || fileLower.includes('/aave/') || fileLower.includes('/money') || fileName.includes('borrow')) return 'lending';
  if (fileLower.includes('/wallet/') || fileLower.includes('/account/') || fileName.includes('wallet') || fileName.includes('account')) return 'wallet';
  if (fileLower.includes('/xcm/') || fileLower.includes('/bridge/') || fileName.includes('xcm') || fileName.includes('bridge')) return 'xcm';
  if (fileLower.includes('/referral') || fileName.includes('referral')) return 'referrals';
  if (fileLower.includes('/democracy/') || fileLower.includes('/governance/') || fileName.includes('democracy') || fileName.includes('referend')) return 'governance';
  if (fileLower.includes('/dca/') || fileName.includes('dca')) return 'dca';
  if (fileLower.includes('/otc/') || fileName.includes('otc')) return 'otc';
  if (fileLower.includes('/api/')) return 'api';

  return 'other';
}

function generateDataSourceDiagram(
  area: string,
  hooks: Array<{ name: string; file: string; line: number; usesSDK: boolean; usesIndexer: boolean }>,
  hookToCalls: Map<string, { l1Direct: string[]; l2Sdk: string[]; l1Legacy: string[]; l3Indexer: string[] }>,
  allCallsByFile: Map<string, { l1Direct: string[]; l2Sdk: string[]; l1Legacy: string[]; l3Indexer: string[] }>
): string {
  const lines: string[] = [
    'flowchart LR',
    `    %% ${area.toUpperCase()} - Data Sources`,
    `    %% Where does ${area} UI get its data?`,
    '',
  ];

  // Collect ALL unique calls from ALL files in this area
  // Use normalized names (without papi./query. prefix) to avoid duplicates
  const allL1Normalized = new Map<string, string>(); // normalized -> original call
  const allL2Normalized = new Map<string, string>();
  const allL3Normalized = new Map<string, string>();

  // Map each file to its calls (normalized)
  const fileToCallsInArea = new Map<string, { l1: string[]; l2: string[]; l3: string[] }>();

  for (const hook of hooks) {
    const fileCalls = allCallsByFile.get(hook.file);
    if (fileCalls) {
      const l1Raw = [...fileCalls.l1Direct, ...fileCalls.l1Legacy];
      const l2Raw = [...fileCalls.l2Sdk];
      const l3Raw = [...fileCalls.l3Indexer];

      // Normalize L1 calls (remove papi.query. or query. prefix)
      const l1Normalized: string[] = [];
      for (const call of l1Raw) {
        const normalized = call.replace('papi.query.', '').replace('query.', '');
        if (!allL1Normalized.has(normalized)) {
          allL1Normalized.set(normalized, call);
        }
        if (!l1Normalized.includes(normalized)) {
          l1Normalized.push(normalized);
        }
      }

      // Normalize L2 calls (remove sdk.api. or sdk.client. prefix)
      const l2Normalized: string[] = [];
      for (const call of l2Raw) {
        const normalized = call.replace('sdk.api.', '').replace('sdk.client.', '');
        if (!allL2Normalized.has(normalized)) {
          allL2Normalized.set(normalized, call);
        }
        if (!l2Normalized.includes(normalized)) {
          l2Normalized.push(normalized);
        }
      }

      // Normalize L3 calls (remove indexerSdk./indexer./squidSdk. prefix)
      const l3Normalized: string[] = [];
      for (const call of l3Raw) {
        const normalized = call.replace('indexerSdk.', '').replace('indexer.', '').replace('squidSdk.', '');
        if (!allL3Normalized.has(normalized)) {
          allL3Normalized.set(normalized, call);
        }
        if (!l3Normalized.includes(normalized)) {
          l3Normalized.push(normalized);
        }
      }

      if (l1Normalized.length > 0 || l2Normalized.length > 0 || l3Normalized.length > 0) {
        fileToCallsInArea.set(hook.file, { l1: l1Normalized, l2: l2Normalized, l3: l3Normalized });
      }
    }
  }

  // Get ALL hooks that indicate they use SDK or indexer
  const hooksWithData = hooks.filter(h =>
    h.usesSDK || h.usesIndexer || fileToCallsInArea.has(h.file)
  );

  if (hooksWithData.length === 0 && allL1Normalized.size === 0 && allL2Normalized.size === 0 && allL3Normalized.size === 0) {
    // No hooks with calls - return minimal diagram
    lines.push(`    subgraph UI["🖥️ UI Hooks - ${area}"]`);
    lines.push('    end');
    lines.push('');
    lines.push('    %% No data source calls detected');
    lines.push('    style UI fill:#f0f9ff,stroke:#0ea5e9');
    return lines.join('\n');
  }

  // UI Hooks subgraph - ALL hooks in this area, no truncation
  lines.push(`    subgraph UI["🖥️ UI Hooks - ${area}"]`);
  for (const hook of hooks) {
    const hookId = sanitizeId(`h_${hook.name}`);
    lines.push(`        ${hookId}["${hook.name}"]`);
  }
  lines.push('    end');
  lines.push('');

  // L1 subgraph - ALL unique L1 calls (deduplicated), no truncation
  if (allL1Normalized.size > 0) {
    lines.push(`    subgraph L1["⚙️ L1: Runtime (RPC)"]`);
    for (const [normalized] of allL1Normalized) {
      const nodeId = sanitizeId(`l1_${normalized}`);
      lines.push(`        ${nodeId}["${normalized}"]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // L2 subgraph - ALL unique L2 SDK calls (deduplicated), no truncation
  if (allL2Normalized.size > 0) {
    lines.push(`    subgraph L2["📦 L2: SDK"]`);
    for (const [normalized] of allL2Normalized) {
      const nodeId = sanitizeId(`l2_${normalized}`);
      lines.push(`        ${nodeId}["${normalized}"]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // L3 subgraph - ALL unique L3 indexer calls (deduplicated), no truncation
  if (allL3Normalized.size > 0) {
    lines.push(`    subgraph L3["🗄️ L3: Indexer"]`);
    for (const [normalized] of allL3Normalized) {
      const nodeId = sanitizeId(`l3_${normalized}`);
      lines.push(`        ${nodeId}["${normalized}"]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // Connections - Hook → calls FROM ITS OWN FILE (using normalized names)
  // If hook file has no calls but hook usesSDK/usesIndexer, connect to first available call
  lines.push('    %% Data flow connections');
  for (const hook of hooks) {
    const hookId = sanitizeId(`h_${hook.name}`);
    const fileCalls = fileToCallsInArea.get(hook.file);

    if (fileCalls) {
      // Connect to each call in this hook's file (already normalized)
      for (const normalized of fileCalls.l1) {
        lines.push(`    ${hookId} --> ${sanitizeId(`l1_${normalized}`)}`);
      }
      for (const normalized of fileCalls.l2) {
        lines.push(`    ${hookId} --> ${sanitizeId(`l2_${normalized}`)}`);
      }
      for (const normalized of fileCalls.l3) {
        lines.push(`    ${hookId} --> ${sanitizeId(`l3_${normalized}`)}`);
      }
    } else if (hook.usesSDK || hook.usesIndexer) {
      // Hook indicates it uses SDK/indexer but file has no direct calls
      // Connect to first available call of appropriate type
      if (hook.usesSDK && allL1Normalized.size > 0) {
        const firstL1 = Array.from(allL1Normalized.keys())[0];
        lines.push(`    ${hookId} -.-> ${sanitizeId(`l1_${firstL1}`)}`);
      }
      if (hook.usesIndexer && allL3Normalized.size > 0) {
        const firstL3 = Array.from(allL3Normalized.keys())[0];
        lines.push(`    ${hookId} -.-> ${sanitizeId(`l3_${firstL3}`)}`);
      }
    }
  }

  // Stats
  lines.push('');
  lines.push(`    %% Hooks: ${hooks.length}, L1: ${allL1Normalized.size}, L2: ${allL2Normalized.size}, L3: ${allL3Normalized.size}`);

  // Styling
  lines.push('');
  lines.push('    %% Styling');
  lines.push('    style UI fill:#f0f9ff,stroke:#0ea5e9');
  if (allL1Normalized.size > 0) lines.push('    style L1 fill:#f0fdf4,stroke:#22c55e');
  if (allL2Normalized.size > 0) lines.push('    style L2 fill:#fef3c7,stroke:#f59e0b');
  if (allL3Normalized.size > 0) lines.push('    style L3 fill:#fff1f2,stroke:#f43f5e');

  return lines.join('\n');
}

function generateDataSourceOverview(
  ui: UIExtraction,
  callsByFile: Map<string, { l1Direct: string[]; l2Sdk: string[]; l1Legacy: string[]; l3Indexer: string[] }>
): string {
  const lines: string[] = [
    'flowchart TB',
    '    %% UI Data Sources Overview',
    '    %% How does Hydration UI fetch data?',
    '',
  ];

  // Collect all unique calls (normalized to avoid duplicates)
  const allL1Normalized = new Set<string>();
  const allL2Normalized = new Set<string>();
  const allL3Normalized = new Set<string>();

  for (const [, calls] of callsByFile) {
    calls.l1Direct.forEach(c => allL1Normalized.add(c.replace('papi.query.', '').replace('query.', '')));
    calls.l1Legacy.forEach(c => allL1Normalized.add(c.replace('papi.query.', '').replace('query.', '')));
    calls.l2Sdk.forEach(c => allL2Normalized.add(c.replace('sdk.api.', '').replace('sdk.client.', '')));
    calls.l3Indexer.forEach(c => allL3Normalized.add(c.replace('indexerSdk.', '').replace('indexer.', '').replace('squidSdk.', '')));
  }

  // Count unique pallets from L1 queries
  const l1Pallets = new Set<string>();
  for (const normalized of allL1Normalized) {
    const parts = normalized.split('.');
    if (parts.length >= 1) l1Pallets.add(parts[0]); // Pallet.Method -> Pallet
  }

  // Count SDK modules
  const sdkModules = new Set<string>();
  for (const normalized of allL2Normalized) {
    const parts = normalized.split('.');
    if (parts.length >= 1) sdkModules.add(parts[0]); // module.method -> module
  }

  const total = ui.hooks.length;

  lines.push('    subgraph Overview["📊 Data Sources Summary"]');
  lines.push(`        hooks["${total} Hooks"]`);
  lines.push('    end');
  lines.push('');

  // L1 calls breakdown - ALL calls (deduplicated), no truncation
  lines.push('    subgraph L1Sources["⚙️ L1: Runtime RPC"]');
  lines.push(`        l1_total["${allL1Normalized.size} unique queries from ${l1Pallets.size} pallets"]`);

  // Count occurrences of each L1 call (by normalized name)
  const l1CallCounts = new Map<string, number>();
  for (const usage of ui.sdkUsage) {
    if (usage.call.startsWith('papi.query.') || usage.call.startsWith('query.')) {
      const normalized = usage.call.replace('papi.query.', '').replace('query.', '');
      l1CallCounts.set(normalized, (l1CallCounts.get(normalized) || 0) + 1);
    }
  }
  // Show ALL L1 calls sorted by count
  const sortedL1 = [...l1CallCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [normalized, count] of sortedL1) {
    lines.push(`        ${sanitizeId(`l1_${normalized}`)}["${normalized} (${count})"]`);
  }
  lines.push('    end');
  lines.push('');

  // L2 SDK breakdown - ALL calls (deduplicated), no truncation
  if (allL2Normalized.size > 0) {
    lines.push('    subgraph L2Sources["📦 L2: SDK"]');
    lines.push(`        l2_total["${allL2Normalized.size} SDK calls from ${sdkModules.size} modules"]`);

    // Count occurrences of each L2 call (by normalized name)
    const l2CallCounts = new Map<string, number>();
    for (const usage of ui.sdkUsage) {
      if (usage.call.startsWith('sdk.api.') || usage.call.startsWith('sdk.client.')) {
        const normalized = usage.call.replace('sdk.api.', '').replace('sdk.client.', '');
        l2CallCounts.set(normalized, (l2CallCounts.get(normalized) || 0) + 1);
      }
    }
    // Show ALL L2 calls sorted by count
    const sortedL2 = [...l2CallCounts.entries()].sort((a, b) => b[1] - a[1]);
    for (const [normalized, count] of sortedL2) {
      lines.push(`        ${sanitizeId(`l2_${normalized}`)}["${normalized} (${count})"]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // L3 Indexer breakdown - ALL calls (deduplicated), no truncation
  lines.push('    subgraph L3Sources["🗄️ L3: Indexer"]');
  if (allL3Normalized.size > 0) {
    lines.push(`        l3_total["${allL3Normalized.size} indexer calls"]`);
    for (const normalized of allL3Normalized) {
      lines.push(`        ${sanitizeId(`l3_${normalized}`)}["${normalized}"]`);
    }
  } else {
    lines.push('        l3_note["Uses react-query"]');
  }
  lines.push('    end');
  lines.push('');

  // Connections
  lines.push('    hooks --> L1Sources');
  if (allL2Normalized.size > 0) lines.push('    hooks --> L2Sources');
  lines.push('    hooks --> L3Sources');
  if (allL2Normalized.size > 0) lines.push('    L2Sources -.-> L1Sources');

  // Styling
  lines.push('');
  lines.push('    %% Styling');
  lines.push('    style Overview fill:#f8fafc,stroke:#64748b');
  lines.push('    style L1Sources fill:#dcfce7,stroke:#22c55e');
  if (allL2Normalized.size > 0) lines.push('    style L2Sources fill:#fef3c7,stroke:#f59e0b');
  lines.push('    style L3Sources fill:#fce7f3,stroke:#ec4899');

  return lines.join('\n');
}

/**
 * Build lookup from SDK L1 calls grouped by pallet
 * e.g., "Staking" -> ["Staking.Staking", "Staking.Positions"]
 */
function buildSdkL1ByPallet(sdk: SDKExtraction): Map<string, string[]> {
  const palletToL1 = new Map<string, string[]>();

  // Process query calls - group by pallet
  for (const query of sdk.apiCalls.query) {
    const parts = query.call.split('.');
    if (parts.length < 2) continue;

    // Normalize: stableswap.pools -> Stableswap, Stableswap.Pools
    const pallet = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const normalized = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('.');

    if (!palletToL1.has(pallet)) palletToL1.set(pallet, []);
    if (!palletToL1.get(pallet)!.includes(normalized)) {
      palletToL1.get(pallet)!.push(normalized);
    }
  }

  return palletToL1;
}

/**
 * Infer which L1 pallets an SDK method likely uses based on method name
 */
function inferL1PalletsForSdkMethod(methodName: string): string[] {
  const lower = methodName.toLowerCase();

  // Farm methods
  if (lower.includes('omnipoolfarm') || lower.includes('allomnipoolfarns')) {
    return ['OmnipoolWarehouseLM', 'OmnipoolLiquidityMining'];
  }
  if (lower.includes('isolatedfarm') || lower.includes('isolatedpool') || lower.includes('xykfarm')) {
    return ['XYKWarehouseLM', 'XYKLiquidityMining'];
  }
  if (lower.includes('farm') || lower.includes('depositreward')) {
    // Generic farm - could be either, show both
    return ['OmnipoolWarehouseLM', 'XYKWarehouseLM'];
  }

  // Staking
  if (lower.includes('staking') || lower.includes('stake') || lower.includes('potbalance')) {
    return ['Staking'];
  }

  // Router/trading
  if (lower.includes('router') || lower.includes('trade') || lower.includes('swap') || lower.includes('sell') || lower.includes('buy')) {
    return ['Router', 'Omnipool', 'XYK', 'Stableswap'];
  }

  // Pools
  if (lower.includes('omnipool')) {
    return ['Omnipool'];
  }
  if (lower.includes('xyk')) {
    return ['XYK'];
  }
  if (lower.includes('stableswap') || lower.includes('stable')) {
    return ['Stableswap'];
  }

  // Scheduler/DCA
  if (lower.includes('scheduler') || lower.includes('dca') || lower.includes('twap') || lower.includes('order')) {
    return ['DCA', 'Scheduler'];
  }

  // Assets
  if (lower.includes('asset') || lower.includes('token')) {
    return ['AssetRegistry', 'Tokens'];
  }

  // Balance
  if (lower.includes('balance')) {
    return ['Balances', 'Tokens'];
  }

  // Aave/lending
  if (lower.includes('aave') || lower.includes('health')) {
    return ['EVM'];
  }

  return [];
}

/**
 * Build lookup from indexer query to entities it provides
 */
function buildIndexerEntitiesMap(indexer: IndexerExtraction | null): Map<string, string[]> {
  const indexerToEntities = new Map<string, string[]>();

  if (!indexer) return indexerToEntities;

  // Map handler events to entity names
  for (const handler of indexer.handlers) {
    const eventName = handler.event.split('.').pop() || handler.event;
    if (!indexerToEntities.has(eventName)) {
      indexerToEntities.set(eventName, []);
    }
    for (const entity of handler.createsEntities) {
      if (!indexerToEntities.get(eventName)!.includes(entity)) {
        indexerToEntities.get(eventName)!.push(entity);
      }
    }
  }

  return indexerToEntities;
}

/**
 * Generate individual diagrams for each hook
 * Each hook gets its own small, focused diagram showing data sources and extrinsics
 */
function generatePerHookDiagrams(
  ui: UIExtraction,
  sdk: SDKExtraction,
  indexer: IndexerExtraction | null,
  outputPath: string
): { total: number; areas: number } {
  // Build lookup maps for full chain resolution
  const palletToL1 = buildSdkL1ByPallet(sdk);
  const indexerEntities = buildIndexerEntitiesMap(indexer);

  // Build lookup maps for quick access
  const callsByFile = new Map<string, {
    l1: string[];      // L1 queries (papi.query.*, query.*)
    l2: string[];      // L2 SDK calls (sdk.api.*, sdk.client.*)
    l3: string[];      // L3 indexer (indexerSdk.*, etc)
    tx: string[];      // Extrinsics (tx.*)
  }>();

  // Process SDK usage
  for (const usage of ui.sdkUsage) {
    if (!callsByFile.has(usage.file)) {
      callsByFile.set(usage.file, { l1: [], l2: [], l3: [], tx: [] });
    }
    const entry = callsByFile.get(usage.file)!;

    if (usage.call.startsWith('papi.query.') || usage.call.startsWith('query.')) {
      const normalized = usage.call.replace('papi.query.', '').replace('query.', '');
      if (!entry.l1.includes(normalized)) entry.l1.push(normalized);
    } else if (usage.call.startsWith('sdk.api.') || usage.call.startsWith('sdk.client.')) {
      const normalized = usage.call.replace('sdk.api.', '').replace('sdk.client.', '');
      if (!entry.l2.includes(normalized)) entry.l2.push(normalized);
    } else if (usage.call.startsWith('tx.')) {
      const normalized = usage.call.replace('tx.', '');
      if (!entry.tx.includes(normalized)) entry.tx.push(normalized);
    }
  }

  // Process indexer usage
  for (const usage of ui.indexerUsage) {
    if (!callsByFile.has(usage.file)) {
      callsByFile.set(usage.file, { l1: [], l2: [], l3: [], tx: [] });
    }
    const entry = callsByFile.get(usage.file)!;

    if (usage.query.startsWith('indexerSdk.') || usage.query.startsWith('indexer.') || usage.query.startsWith('squidSdk.')) {
      const normalized = usage.query.replace('indexerSdk.', '').replace('indexer.', '').replace('squidSdk.', '');
      if (!entry.l3.includes(normalized)) entry.l3.push(normalized);
    }
  }

  // Group hooks by feature area
  const hooksByArea = new Map<string, typeof ui.hooks>();
  for (const hook of ui.hooks) {
    const area = extractFeatureArea(hook.file);
    if (!hooksByArea.has(area)) hooksByArea.set(area, []);
    hooksByArea.get(area)!.push(hook);
  }

  let totalGenerated = 0;

  // Generate diagrams for each area
  for (const [area, hooks] of hooksByArea) {
    const areaPath = join(outputPath, area);
    mkdirSync(areaPath, { recursive: true });

    for (const hook of hooks) {
      const fileCalls = callsByFile.get(hook.file);
      const diagram = generateSingleHookDiagram(hook, fileCalls, palletToL1, indexerEntities);

      if (diagram) {
        const fileName = `${hook.name}.mmd`;
        writeFileSync(join(areaPath, fileName), diagram);
        totalGenerated++;
      }
    }
  }

  return { total: totalGenerated, areas: hooksByArea.size };
}

/**
 * Generate a small, focused diagram for a single hook showing full call chain
 */
function generateSingleHookDiagram(
  hook: { name: string; file: string; line: number; usesSDK: boolean; usesIndexer: boolean },
  calls: { l1: string[]; l2: string[]; l3: string[]; tx: string[] } | undefined,
  palletToL1: Map<string, string[]>,
  indexerEntities: Map<string, string[]>
): string | null {
  const hasL1 = calls && calls.l1.length > 0;
  const hasL2 = calls && calls.l2.length > 0;
  const hasL3 = calls && calls.l3.length > 0;
  const hasTx = calls && calls.tx.length > 0;

  // Skip hooks with no data sources
  if (!hasL1 && !hasL2 && !hasL3 && !hasTx) {
    return null;
  }

  const lines: string[] = [
    'flowchart LR',
    `    %% ${hook.name}`,
    `    %% Source: ${hook.file}:${hook.line}`,
    '',
  ];

  const hookId = 'hook';
  lines.push(`    ${hookId}(["${hook.name}"])`);
  lines.push('');

  // Collect L1 calls from SDK using method-name inference
  // Map: L2 call -> L1 calls it makes
  const l2ToL1Calls = new Map<string, string[]>();
  const l1FromSdk = new Set<string>();

  if (hasL2) {
    for (const l2Call of calls!.l2) {
      // Use method name to infer which pallets it calls
      const methodName = l2Call.split('.').pop() || l2Call;
      const pallets = inferL1PalletsForSdkMethod(methodName);

      const l1CallsForThis: string[] = [];
      for (const pallet of pallets) {
        const l1Calls = palletToL1.get(pallet);
        if (l1Calls) {
          // Take up to 2 calls per pallet
          for (const call of l1Calls.slice(0, 2)) {
            if (!l1CallsForThis.includes(call)) {
              l1CallsForThis.push(call);
              l1FromSdk.add(call);
            }
          }
        }
      }
      if (l1CallsForThis.length > 0) {
        l2ToL1Calls.set(l2Call, l1CallsForThis);
      }
    }
  }

  // Direct L1 queries (reads)
  const allL1 = new Set([...(calls?.l1 || []), ...l1FromSdk]);
  if (allL1.size > 0) {
    lines.push('    subgraph L1["L1: Runtime"]');
    for (const call of allL1) {
      const nodeId = sanitizeId(`l1_${call}`);
      lines.push(`        ${nodeId}["${call}"]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // L2 SDK calls with chain to L1
  if (hasL2) {
    lines.push('    subgraph L2["L2: SDK"]');
    for (const call of calls!.l2) {
      const nodeId = sanitizeId(`l2_${call}`);
      lines.push(`        ${nodeId}["${call}"]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // L3 indexer queries
  if (hasL3) {
    lines.push('    subgraph L3["L3: Indexer"]');
    for (const call of calls!.l3) {
      const nodeId = sanitizeId(`l3_${call}`);
      lines.push(`        ${nodeId}["${call}"]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // Extrinsics (mutations)
  if (hasTx) {
    lines.push('    subgraph TX["Extrinsics"]');
    for (const call of calls!.tx) {
      const nodeId = sanitizeId(`tx_${call}`);
      lines.push(`        ${nodeId}["${call}"]`);
    }
    lines.push('    end');
    lines.push('');
  }

  // Connections
  lines.push('    %% Data flow');

  // Hook -> Direct L1
  if (hasL1) {
    for (const call of calls!.l1) {
      const nodeId = sanitizeId(`l1_${call}`);
      lines.push(`    ${hookId} -.->|query| ${nodeId}`);
    }
  }

  // Hook -> L2 -> L1 (full chain with correct mapping)
  if (hasL2) {
    for (const l2Call of calls!.l2) {
      const l2NodeId = sanitizeId(`l2_${l2Call}`);
      lines.push(`    ${hookId} -->|call| ${l2NodeId}`);

      // L2 -> L1 chain using inferred mapping
      const l1Calls = l2ToL1Calls.get(l2Call);
      if (l1Calls && l1Calls.length > 0) {
        for (const l1Call of l1Calls.slice(0, 3)) { // Show max 3 L1 calls per SDK call
          const l1NodeId = sanitizeId(`l1_${l1Call}`);
          lines.push(`    ${l2NodeId} -.-> ${l1NodeId}`);
        }
      }
    }
  }

  // Hook -> L3
  if (hasL3) {
    for (const call of calls!.l3) {
      const nodeId = sanitizeId(`l3_${call}`);
      lines.push(`    ${hookId} -.->|fetch| ${nodeId}`);
    }
  }

  // Hook -> TX (mutations)
  if (hasTx) {
    for (const call of calls!.tx) {
      const nodeId = sanitizeId(`tx_${call}`);
      lines.push(`    ${hookId} -->|submit| ${nodeId}`);
    }
  }

  // Styling
  lines.push('');
  lines.push('    %% Styling');
  lines.push('    style hook fill:#e0f2fe,stroke:#0284c7');
  if (allL1.size > 0) lines.push('    style L1 fill:#dcfce7,stroke:#22c55e');
  if (hasL2) lines.push('    style L2 fill:#fef3c7,stroke:#f59e0b');
  if (hasL3) lines.push('    style L3 fill:#fce7f3,stroke:#ec4899');
  if (hasTx) lines.push('    style TX fill:#fee2e2,stroke:#ef4444');

  return lines.join('\n');
}

/**
 * Generate an index showing all hooks and their data sources as a matrix
 */
function generateHookIndex(ui: UIExtraction, hooksPath: string): string {
  // Build lookup maps
  const callsByFile = new Map<string, {
    l1: string[];
    l2: string[];
    l3: string[];
    tx: string[];
  }>();

  for (const usage of ui.sdkUsage) {
    if (!callsByFile.has(usage.file)) {
      callsByFile.set(usage.file, { l1: [], l2: [], l3: [], tx: [] });
    }
    const entry = callsByFile.get(usage.file)!;

    if (usage.call.startsWith('papi.query.') || usage.call.startsWith('query.')) {
      const normalized = usage.call.replace('papi.query.', '').replace('query.', '');
      if (!entry.l1.includes(normalized)) entry.l1.push(normalized);
    } else if (usage.call.startsWith('sdk.api.') || usage.call.startsWith('sdk.client.')) {
      const normalized = usage.call.replace('sdk.api.', '').replace('sdk.client.', '');
      if (!entry.l2.includes(normalized)) entry.l2.push(normalized);
    } else if (usage.call.startsWith('tx.')) {
      const normalized = usage.call.replace('tx.', '');
      if (!entry.tx.includes(normalized)) entry.tx.push(normalized);
    }
  }

  for (const usage of ui.indexerUsage) {
    if (!callsByFile.has(usage.file)) {
      callsByFile.set(usage.file, { l1: [], l2: [], l3: [], tx: [] });
    }
    const entry = callsByFile.get(usage.file)!;

    if (usage.query.startsWith('indexerSdk.') || usage.query.startsWith('indexer.') || usage.query.startsWith('squidSdk.')) {
      const normalized = usage.query.replace('indexerSdk.', '').replace('indexer.', '').replace('squidSdk.', '');
      if (!entry.l3.includes(normalized)) entry.l3.push(normalized);
    }
  }

  // Group hooks by area
  const hooksByArea = new Map<string, Array<{
    hook: typeof ui.hooks[0];
    calls: { l1: string[]; l2: string[]; l3: string[]; tx: string[] };
  }>>();

  for (const hook of ui.hooks) {
    const area = extractFeatureArea(hook.file);
    if (!hooksByArea.has(area)) hooksByArea.set(area, []);

    const calls = callsByFile.get(hook.file) || { l1: [], l2: [], l3: [], tx: [] };
    hooksByArea.get(area)!.push({ hook, calls });
  }

  // Generate markdown
  const lines: string[] = [
    '# Hook Data Sources Index',
    '',
    '> Auto-generated index of all UI hooks and their data sources.',
    '',
    '## Summary',
    '',
    `- **Total Hooks**: ${ui.hooks.length}`,
    `- **Feature Areas**: ${hooksByArea.size}`,
    '',
    '## By Feature Area',
    '',
  ];

  // Sort areas
  const sortedAreas = [...hooksByArea.keys()].sort();

  for (const area of sortedAreas) {
    const areaHooks = hooksByArea.get(area)!;
    lines.push(`### ${area.charAt(0).toUpperCase() + area.slice(1)}`);
    lines.push('');
    lines.push('| Hook | L1 (Runtime) | L2 (SDK) | L3 (Indexer) | TX |');
    lines.push('|------|--------------|----------|--------------|-----|');

    for (const { hook, calls } of areaHooks) {
      const l1 = calls.l1.length > 0 ? calls.l1.slice(0, 2).join(', ') + (calls.l1.length > 2 ? '...' : '') : '-';
      const l2 = calls.l2.length > 0 ? calls.l2.slice(0, 2).join(', ') + (calls.l2.length > 2 ? '...' : '') : '-';
      const l3 = calls.l3.length > 0 ? calls.l3.slice(0, 2).join(', ') + (calls.l3.length > 2 ? '...' : '') : '-';
      const tx = calls.tx.length > 0 ? calls.tx.slice(0, 2).join(', ') + (calls.tx.length > 2 ? '...' : '') : '-';

      const hasDiagram = calls.l1.length > 0 || calls.l2.length > 0 || calls.l3.length > 0 || calls.tx.length > 0;
      const hookLink = hasDiagram ? `[${hook.name}](./${area}/${hook.name}.mmd)` : hook.name;

      lines.push(`| ${hookLink} | ${l1} | ${l2} | ${l3} | ${tx} |`);
    }
    lines.push('');
  }

  // Add reverse index: data source -> hooks
  lines.push('## By Data Source');
  lines.push('');
  lines.push('Which hooks use each data source?');
  lines.push('');

  // Collect all data sources
  const l1ToHooks = new Map<string, string[]>();
  const l2ToHooks = new Map<string, string[]>();
  const l3ToHooks = new Map<string, string[]>();

  for (const [area, areaHooks] of hooksByArea) {
    for (const { hook, calls } of areaHooks) {
      for (const call of calls.l1) {
        if (!l1ToHooks.has(call)) l1ToHooks.set(call, []);
        l1ToHooks.get(call)!.push(hook.name);
      }
      for (const call of calls.l2) {
        if (!l2ToHooks.has(call)) l2ToHooks.set(call, []);
        l2ToHooks.get(call)!.push(hook.name);
      }
      for (const call of calls.l3) {
        if (!l3ToHooks.has(call)) l3ToHooks.set(call, []);
        l3ToHooks.get(call)!.push(hook.name);
      }
    }
  }

  if (l1ToHooks.size > 0) {
    lines.push('### L1: Runtime Queries');
    lines.push('');
    const sortedL1 = [...l1ToHooks.entries()].sort((a, b) => b[1].length - a[1].length);
    for (const [call, hooks] of sortedL1.slice(0, 20)) {
      lines.push(`- **${call}** (${hooks.length}): ${hooks.slice(0, 5).join(', ')}${hooks.length > 5 ? '...' : ''}`);
    }
    if (sortedL1.length > 20) {
      lines.push(`- ... and ${sortedL1.length - 20} more`);
    }
    lines.push('');
  }

  if (l2ToHooks.size > 0) {
    lines.push('### L2: SDK Calls');
    lines.push('');
    const sortedL2 = [...l2ToHooks.entries()].sort((a, b) => b[1].length - a[1].length);
    for (const [call, hooks] of sortedL2) {
      lines.push(`- **${call}** (${hooks.length}): ${hooks.slice(0, 5).join(', ')}${hooks.length > 5 ? '...' : ''}`);
    }
    lines.push('');
  }

  if (l3ToHooks.size > 0) {
    lines.push('### L3: Indexer Queries');
    lines.push('');
    const sortedL3 = [...l3ToHooks.entries()].sort((a, b) => b[1].length - a[1].length);
    for (const [call, hooks] of sortedL3) {
      lines.push(`- **${call}** (${hooks.length}): ${hooks.slice(0, 5).join(', ')}${hooks.length > 5 ? '...' : ''}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function generateFlowsIndex(
  flowsPath: string,
  uiFlows: string[],
  sdkFlows: string[],
  dataSourceFlows: string[] = []
): void {
  const indexContent = `# Generated Flows

> Auto-generated from extraction data at ${new Date().toISOString()}

## Structure

- **from-ui/**: User-initiated feature journeys (L4 → L2 → L1)
- **from-sdk/**: SDK class method traces to runtime (L2 → L1)
- **from-runtime/**: Event emission to indexer capture (L1 → L3)
- **data-sources/**: Where UI components get their data

## From UI (L4 → L1)

User feature flows showing hooks, API calls, and runtime pallets.

${uiFlows.map(f => `- [${f}](from-ui/${f}.mmd)`).join('\n')}

## From SDK (L2 → L1)

SDK class flows showing methods and their runtime calls.

${sdkFlows.map(f => `- [${f}](from-sdk/${f}.mmd)`).join('\n')}

## From Runtime (L1 → L3)

Event flows showing what gets indexed.

See \`from-runtime/\` directory for category-based event flows.

## Data Sources

Where does the UI get its data from?

${dataSourceFlows.map(f => `- [${f}](data-sources/${f}.mmd)`).join('\n')}

## Legend

\`\`\`
🖥️ L4: UI       - React components and hooks
📦 L2: SDK      - TypeScript SDK classes
⚙️ L1: Runtime  - Substrate pallets (RPC queries)
🗄️ L3: Indexer  - Squid GraphQL API

→  Solid arrow  = Transaction/mutation call
⤑  Dashed arrow = Query/read call
✓  Checkmark    = Event is indexed

Data Sources:
🟢 L1 Only   = Direct RPC to runtime
🩷 L3 Only   = GraphQL from indexer
🟡 Hybrid    = Both L1 and L3
\`\`\`

## Viewing

- Open .mmd files in VS Code with Mermaid extension
- Or paste into [mermaid.live](https://mermaid.live)
`;

  writeFileSync(join(flowsPath, 'README.md'), indexContent);
}

function sanitizeId(str: string): string {
  return str.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 50);
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const extractionsPath = process.env.RAW_PATH || './raw';
  const outputPath = process.env.OUTPUT_PATH || './docs';

  synthesizeFlows({ extractionsPath, outputPath }).catch((err) => {
    console.error('Flow generation failed:', err);
    process.exit(1);
  });
}
