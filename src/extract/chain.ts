/**
 * Chain Metadata Extraction with Chopsticks
 *
 * Two modes:
 * 1. Live: Connect to mainnet RPC
 * 2. Fork: Use Chopsticks to fork mainnet (for testing/comparison)
 *
 * Compares extracted metadata against saved baseline to detect changes.
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { join } from 'path';
import { existsSync } from 'fs';
import { createLogger } from '../utils/logger.js';
import { writeJSON, readJSON, writeFile } from '../utils/files.js';

const log = createLogger('chain');

const ENDPOINTS = {
  mainnet: 'wss://rpc.hydradx.cloud',
  testnet: 'wss://paseo-rpc.hydradx.io',
  local: 'ws://localhost:8000',  // Chopsticks default
};

interface PalletMeta {
  name: string;
  index: number;
  calls: string[];
  events: string[];
  storage: string[];
  constants: string[];
}

interface ChainMetadata {
  extractedAt: string;
  source: 'mainnet' | 'testnet' | 'local' | 'chopsticks';
  endpoint: string;
  specName: string;
  specVersion: number;
  blockNumber: number;
  blockHash: string;
  pallets: PalletMeta[];
  stats: {
    pallets: number;
    calls: number;
    events: number;
    storage: number;
  };
}

interface MetadataDiff {
  added: { pallets: string[]; calls: string[]; events: string[]; storage: string[] };
  removed: { pallets: string[]; calls: string[]; events: string[]; storage: string[] };
  changed: { pallets: string[] };
}

// Reserved for future use when we need type resolution
// function resolveTypeName(registry: any, typeId: number): string {
//   try {
//     return registry.lookup.getTypeDef(typeId).type || `Type#${typeId}`;
//   } catch {
//     return `Type#${typeId}`;
//   }
// }

export async function extractChainMetadata(
  source: 'mainnet' | 'testnet' | 'local' = 'mainnet'
): Promise<ChainMetadata> {
  const endpoint = ENDPOINTS[source];
  log.section(`Connecting to ${source}: ${endpoint}`);

  const provider = new WsProvider(endpoint);
  const api = await ApiPromise.create({ provider });
  await api.isReady;

  log.success('Connected');

  const header = await api.rpc.chain.getHeader();
  const palletsMeta = api.runtimeMetadata.asLatest.pallets;

  const pallets: PalletMeta[] = [];
  let totalCalls = 0;
  let totalEvents = 0;
  let totalStorage = 0;

  for (const pallet of palletsMeta) {
    const name = pallet.name.toString();

    // Extract call names
    const calls: string[] = [];
    if (pallet.calls.isSome) {
      const callsType = pallet.calls.unwrap().type.toNumber();
      const callsDef = api.registry.lookup.getTypeDef(callsType);
      if (callsDef.sub && Array.isArray(callsDef.sub)) {
        for (const variant of callsDef.sub) {
          if (variant.name && !variant.name.startsWith('__')) {
            calls.push(`${name}.${variant.name}`);
            totalCalls++;
          }
        }
      }
    }

    // Extract event names
    const events: string[] = [];
    if (pallet.events.isSome) {
      const eventsType = pallet.events.unwrap().type.toNumber();
      const eventsDef = api.registry.lookup.getTypeDef(eventsType);
      if (eventsDef.sub && Array.isArray(eventsDef.sub)) {
        for (const variant of eventsDef.sub) {
          if (variant.name) {
            events.push(`${name}.${variant.name}`);
            totalEvents++;
          }
        }
      }
    }

    // Extract storage names
    const storage: string[] = [];
    if (pallet.storage.isSome) {
      const storageData = pallet.storage.unwrap();
      for (const item of storageData.items) {
        storage.push(`${name}.${item.name.toString()}`);
        totalStorage++;
      }
    }

    // Extract constant names
    const constants = pallet.constants.map(c => `${name}.${c.name.toString()}`);

    pallets.push({ name, index: pallet.index.toNumber(), calls, events, storage, constants });
  }

  const result: ChainMetadata = {
    extractedAt: new Date().toISOString(),
    source,
    endpoint,
    specName: api.runtimeVersion.specName.toString(),
    specVersion: api.runtimeVersion.specVersion.toNumber(),
    blockNumber: header.number.toNumber(),
    blockHash: header.hash.toHex(),
    pallets,
    stats: {
      pallets: pallets.length,
      calls: totalCalls,
      events: totalEvents,
      storage: totalStorage,
    },
  };

  await api.disconnect();
  return result;
}

export function compareMetadata(current: ChainMetadata, baseline: ChainMetadata): MetadataDiff {
  const diff: MetadataDiff = {
    added: { pallets: [], calls: [], events: [], storage: [] },
    removed: { pallets: [], calls: [], events: [], storage: [] },
    changed: { pallets: [] },
  };

  const baselinePallets = new Map(baseline.pallets.map(p => [p.name, p]));
  const currentPallets = new Map(current.pallets.map(p => [p.name, p]));

  // Check for added/changed pallets
  for (const [name, pallet] of currentPallets) {
    const basePallet = baselinePallets.get(name);
    if (!basePallet) {
      diff.added.pallets.push(name);
      diff.added.calls.push(...pallet.calls);
      diff.added.events.push(...pallet.events);
      diff.added.storage.push(...pallet.storage);
    } else {
      // Check for changes within pallet
      const baseCalls = new Set(basePallet.calls);
      const baseEvents = new Set(basePallet.events);
      const baseStorage = new Set(basePallet.storage);

      for (const call of pallet.calls) {
        if (!baseCalls.has(call)) diff.added.calls.push(call);
      }
      for (const event of pallet.events) {
        if (!baseEvents.has(event)) diff.added.events.push(event);
      }
      for (const storage of pallet.storage) {
        if (!baseStorage.has(storage)) diff.added.storage.push(storage);
      }

      // Check for removals
      for (const call of basePallet.calls) {
        if (!pallet.calls.includes(call)) diff.removed.calls.push(call);
      }
      for (const event of basePallet.events) {
        if (!pallet.events.includes(event)) diff.removed.events.push(event);
      }
      for (const storage of basePallet.storage) {
        if (!pallet.storage.includes(storage)) diff.removed.storage.push(storage);
      }

      // Mark as changed if anything differs
      const addedForPallet = [
        ...diff.added.calls.filter(c => c.startsWith(`${name}.`)),
        ...diff.removed.calls.filter(c => c.startsWith(`${name}.`)),
        ...diff.added.events.filter(e => e.startsWith(`${name}.`)),
        ...diff.removed.events.filter(e => e.startsWith(`${name}.`)),
      ];
      if (addedForPallet.length > 0) {
        diff.changed.pallets.push(name);
      }
    }
  }

  // Check for removed pallets
  for (const [name, pallet] of baselinePallets) {
    if (!currentPallets.has(name)) {
      diff.removed.pallets.push(name);
      diff.removed.calls.push(...pallet.calls);
      diff.removed.events.push(...pallet.events);
      diff.removed.storage.push(...pallet.storage);
    }
  }

  return diff;
}

function generateDiffReport(current: ChainMetadata, baseline: ChainMetadata, diff: MetadataDiff): string {
  const hasChanges =
    diff.added.pallets.length > 0 ||
    diff.removed.pallets.length > 0 ||
    diff.added.calls.length > 0 ||
    diff.removed.calls.length > 0 ||
    diff.added.events.length > 0 ||
    diff.removed.events.length > 0;

  let md = `# Metadata Diff Report

## Comparison

| | Baseline | Current |
|--|----------|---------|
| Spec Version | ${baseline.specVersion} | ${current.specVersion} |
| Block | #${baseline.blockNumber} | #${current.blockNumber} |
| Pallets | ${baseline.stats.pallets} | ${current.stats.pallets} |
| Calls | ${baseline.stats.calls} | ${current.stats.calls} |
| Events | ${baseline.stats.events} | ${current.stats.events} |
| Storage | ${baseline.stats.storage} | ${current.stats.storage} |

## Status

${hasChanges ? '**CHANGES DETECTED**' : 'No changes detected.'}

`;

  if (diff.added.pallets.length > 0) {
    md += `### Added Pallets (${diff.added.pallets.length})\n`;
    md += diff.added.pallets.map(p => `- ${p}`).join('\n') + '\n\n';
  }

  if (diff.removed.pallets.length > 0) {
    md += `### Removed Pallets (${diff.removed.pallets.length})\n`;
    md += diff.removed.pallets.map(p => `- ${p}`).join('\n') + '\n\n';
  }

  if (diff.added.calls.length > 0) {
    md += `### Added Calls (${diff.added.calls.length})\n\n`;
    md += diff.added.calls.map(c => `- ${c}`).join('\n') + '\n\n';
  }

  if (diff.removed.calls.length > 0) {
    md += `### Removed Calls (${diff.removed.calls.length})\n\n`;
    md += diff.removed.calls.map(c => `- ${c}`).join('\n') + '\n\n';
  }

  if (diff.added.events.length > 0) {
    md += `### Added Events (${diff.added.events.length})\n\n`;
    md += diff.added.events.map(e => `- ${e}`).join('\n') + '\n\n';
  }

  if (diff.removed.events.length > 0) {
    md += `### Removed Events (${diff.removed.events.length})\n\n`;
    md += diff.removed.events.map(e => `- ${e}`).join('\n') + '\n\n';
  }

  if (diff.added.storage.length > 0) {
    md += `### Added Storage (${diff.added.storage.length})\n\n`;
    md += diff.added.storage.map(s => `- ${s}`).join('\n') + '\n\n';
  }

  if (diff.removed.storage.length > 0) {
    md += `### Removed Storage (${diff.removed.storage.length})\n\n`;
    md += diff.removed.storage.map(s => `- ${s}`).join('\n') + '\n\n';
  }

  return md;
}

interface ExtractOptions {
  source?: 'mainnet' | 'testnet' | 'local';
  outputPath?: string;
  compareBaseline?: boolean;
  saveAsBaseline?: boolean;
}

export async function extract(options: ExtractOptions = {}): Promise<void> {
  const {
    source = 'mainnet',
    outputPath = './extractions/metadata',
    compareBaseline = true,
    saveAsBaseline = false,
  } = options;

  log.section('Chain Metadata Extraction');

  // Extract current metadata
  const current = await extractChainMetadata(source);
  log.success(`Extracted: ${current.stats.pallets} pallets, ${current.stats.calls} calls, ${current.stats.events} events`);

  // Save current
  writeJSON(join(outputPath, 'current.json'), current);
  log.success('Saved current.json');

  // Compare against baseline if exists and has compatible format
  const baselinePath = join(outputPath, 'baseline.json');
  if (compareBaseline && existsSync(baselinePath)) {
    log.section('Comparing Against Baseline');
    const baseline = readJSON<ChainMetadata>(baselinePath);
    if (baseline && baseline.pallets?.[0]?.calls?.[0] && typeof baseline.pallets[0].calls[0] === 'string') {
      // Compatible format - compare
      const diff = compareMetadata(current, baseline);
      const report = generateDiffReport(current, baseline, diff);
      writeFile(join(outputPath, 'DIFF.md'), report);
      writeJSON(join(outputPath, 'diff.json'), diff);

      const hasChanges =
        diff.added.pallets.length + diff.removed.pallets.length +
        diff.added.calls.length + diff.removed.calls.length +
        diff.added.events.length + diff.removed.events.length;

      if (hasChanges > 0) {
        log.warn(`CHANGES DETECTED: ${hasChanges} differences from baseline`);
      } else {
        log.success('No changes from baseline');
      }
    } else {
      log.warn('Baseline format incompatible, skipping comparison. Run with SAVE_BASELINE=true to update.');
    }
  }

  // Optionally save as new baseline
  if (saveAsBaseline) {
    writeJSON(baselinePath, current);
    log.success('Saved as new baseline');
  }

  log.section('Extraction Complete');
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const source = (process.env.SOURCE || 'mainnet') as 'mainnet' | 'testnet' | 'local';
  const outputPath = process.env.OUTPUT_PATH || './extractions/metadata';
  const saveAsBaseline = process.env.SAVE_BASELINE === 'true';

  extract({ source, outputPath, saveAsBaseline })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Extraction failed:', err);
      process.exit(1);
    });
}
