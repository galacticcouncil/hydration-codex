/**
 * Deep Metadata Extraction
 *
 * This extracts the ACTUAL runtime metadata from the live chain,
 * not from source code parsing. This is the "source of truth".
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { join } from 'path';
import { createLogger } from '../utils/logger.js';
import { writeJSON, writeFile } from '../utils/files.js';

const log = createLogger('metadata');

const RPC_ENDPOINTS = {
  mainnet: 'wss://rpc.hydradx.cloud',
  testnet: 'wss://paseo-rpc.hydradx.io',
};

interface PalletMeta {
  name: string;
  index: number;
  storage: StorageItemMeta[];
  calls: CallMeta[];
  events: EventMeta[];
  errors: ErrorMeta[];
  constants: ConstantMeta[];
}

interface StorageItemMeta {
  name: string;
  modifier: string;  // Optional, Default
  type: string;      // Full type description
  keyType?: string;  // For maps
  valueType: string;
  docs: string;
}

interface CallMeta {
  name: string;
  index: number;
  args: { name: string; type: string }[];
  docs: string;
}

interface EventMeta {
  name: string;
  index: number;
  fields: { name: string; type: string }[];
  docs: string;
}

interface ErrorMeta {
  name: string;
  index: number;
  docs: string;
}

interface ConstantMeta {
  name: string;
  type: string;
  value: string;
  docs: string;
}

interface RuntimeMeta {
  specName: string;
  specVersion: number;
  implVersion: number;
  blockNumber: number;
  blockHash: string;
  extractedAt: string;
  pallets: PalletMeta[];
  stats: {
    palletCount: number;
    storageCount: number;
    callCount: number;
    eventCount: number;
    errorCount: number;
  };
}

function resolveType(registry: any, typeId: number): string {
  try {
    const typeDef = registry.lookup.getTypeDef(typeId);
    return typeDef.type || `Type#${typeId}`;
  } catch {
    return `Type#${typeId}`;
  }
}

export async function extractMetadata(
  network: 'mainnet' | 'testnet' = 'mainnet',
  outputPath: string
): Promise<RuntimeMeta> {
  const endpoint = RPC_ENDPOINTS[network];
  log.section(`Connecting to ${network}: ${endpoint}`);

  const provider = new WsProvider(endpoint);
  const api = await ApiPromise.create({ provider });

  await api.isReady;
  log.success('Connected to chain');

  // Get chain info
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);

  const header = await api.rpc.chain.getHeader();
  const blockHash = header.hash.toHex();
  const blockNumber = header.number.toNumber();

  log.info(`Chain: ${chain}`);
  log.info(`Node: ${nodeName} v${nodeVersion}`);
  log.info(`Block: #${blockNumber}`);

  const metadata = api.runtimeMetadata;
  const registry = api.registry;
  const palletsMeta = metadata.asLatest.pallets;

  log.section('Extracting Pallets');

  const pallets: PalletMeta[] = [];
  let totalStorage = 0;
  let totalCalls = 0;
  let totalEvents = 0;
  let totalErrors = 0;

  for (const pallet of palletsMeta) {
    const palletName = pallet.name.toString();
    const palletIndex = pallet.index.toNumber();

    // Extract storage
    const storage: StorageItemMeta[] = [];
    if (pallet.storage.isSome) {
      const storageData = pallet.storage.unwrap();
      for (const item of storageData.items) {
        const itemName = item.name.toString();
        const modifier = item.modifier.toString();
        const docs = item.docs.map(d => d.toString()).join(' ');

        let type = '';
        let keyType: string | undefined;
        let valueType = '';

        if (item.type.isPlain) {
          valueType = resolveType(registry, item.type.asPlain.toNumber());
          type = `Value<${valueType}>`;
        } else if (item.type.isMap) {
          const mapType = item.type.asMap;
          keyType = resolveType(registry, mapType.key.toNumber());
          valueType = resolveType(registry, mapType.value.toNumber());
          const hashers = mapType.hashers.map(h => h.toString()).join(', ');
          type = `Map<${keyType} -> ${valueType}> [${hashers}]`;
        }

        storage.push({ name: itemName, modifier, type, keyType, valueType, docs });
        totalStorage++;
      }
    }

    // Extract calls (extrinsics)
    const calls: CallMeta[] = [];
    if (pallet.calls.isSome) {
      const callsType = pallet.calls.unwrap().type.toNumber();
      const callsDef = registry.lookup.getTypeDef(callsType);

      if (callsDef.sub && Array.isArray(callsDef.sub)) {
        let idx = 0;
        for (const variant of callsDef.sub) {
          const callName = variant.name || `call_${idx}`;
          const args: { name: string; type: string }[] = [];

          if (variant.sub && Array.isArray(variant.sub)) {
            for (const field of variant.sub) {
              args.push({
                name: field.name || 'arg',
                type: field.type || 'unknown',
              });
            }
          }

          calls.push({
            name: callName,
            index: idx,
            args,
            docs: '', // docs not easily available in this structure
          });
          idx++;
          totalCalls++;
        }
      }
    }

    // Extract events
    const events: EventMeta[] = [];
    if (pallet.events.isSome) {
      const eventsType = pallet.events.unwrap().type.toNumber();
      const eventsDef = registry.lookup.getTypeDef(eventsType);

      if (eventsDef.sub && Array.isArray(eventsDef.sub)) {
        let idx = 0;
        for (const variant of eventsDef.sub) {
          const eventName = variant.name || `event_${idx}`;
          const fields: { name: string; type: string }[] = [];

          if (variant.sub && Array.isArray(variant.sub)) {
            for (const field of variant.sub) {
              fields.push({
                name: field.name || 'field',
                type: field.type || 'unknown',
              });
            }
          }

          events.push({
            name: eventName,
            index: idx,
            fields,
            docs: '',
          });
          idx++;
          totalEvents++;
        }
      }
    }

    // Extract errors
    const errors: ErrorMeta[] = [];
    if (pallet.errors.isSome) {
      const errorsType = pallet.errors.unwrap().type.toNumber();
      const errorsDef = registry.lookup.getTypeDef(errorsType);

      if (errorsDef.sub && Array.isArray(errorsDef.sub)) {
        let idx = 0;
        for (const variant of errorsDef.sub) {
          errors.push({
            name: variant.name || `error_${idx}`,
            index: idx,
            docs: '',
          });
          idx++;
          totalErrors++;
        }
      }
    }

    // Extract constants
    const constants: ConstantMeta[] = [];
    for (const constant of pallet.constants) {
      constants.push({
        name: constant.name.toString(),
        type: resolveType(registry, constant.type.toNumber()),
        value: constant.value.toHex(),
        docs: constant.docs.map(d => d.toString()).join(' '),
      });
    }

    pallets.push({
      name: palletName,
      index: palletIndex,
      storage,
      calls,
      events,
      errors,
      constants,
    });

    log.info(`  ${palletName}: ${storage.length} storage, ${calls.length} calls, ${events.length} events`);
  }

  const result: RuntimeMeta = {
    specName: api.runtimeVersion.specName.toString(),
    specVersion: api.runtimeVersion.specVersion.toNumber(),
    implVersion: api.runtimeVersion.implVersion.toNumber(),
    blockNumber,
    blockHash,
    extractedAt: new Date().toISOString(),
    pallets,
    stats: {
      palletCount: pallets.length,
      storageCount: totalStorage,
      callCount: totalCalls,
      eventCount: totalEvents,
      errorCount: totalErrors,
    },
  };

  // Write outputs
  writeJSON(join(outputPath, 'metadata.json'), result);
  log.success('Wrote metadata.json');

  // Generate summary markdown
  const markdown = generateMetadataMarkdown(result);
  writeFile(join(outputPath, 'RUNTIME_TRUTH.md'), markdown);
  log.success('Wrote RUNTIME_TRUTH.md');

  // Disconnect
  await api.disconnect();

  log.section('Metadata Extraction Complete');
  log.success(`Pallets: ${result.stats.palletCount}`);
  log.success(`Storage: ${result.stats.storageCount}`);
  log.success(`Calls: ${result.stats.callCount}`);
  log.success(`Events: ${result.stats.eventCount}`);

  return result;
}

function generateMetadataMarkdown(meta: RuntimeMeta): string {
  let md = `# Hydration Runtime Truth

> Extracted from live chain at block #${meta.blockNumber}
> Spec: ${meta.specName} v${meta.specVersion}
> Extracted: ${meta.extractedAt}

## Statistics

| Metric | Count |
|--------|-------|
| Pallets | ${meta.stats.palletCount} |
| Storage Items | ${meta.stats.storageCount} |
| Extrinsics | ${meta.stats.callCount} |
| Events | ${meta.stats.eventCount} |
| Errors | ${meta.stats.errorCount} |

## Pallets

`;

  // Group pallets by category
  const customPallets = meta.pallets.filter(p =>
    p.name.match(/Omnipool|Dca|Stableswap|Lbp|Xyk|CircuitBreaker|Bonds|Broadcast|Otc|Staking|Referrals/i)
  );
  const systemPallets = meta.pallets.filter(p =>
    p.name.match(/System|Timestamp|Balances|Assets|Treasury|Democracy|Council|Elections/i)
  );
  const xcmPallets = meta.pallets.filter(p =>
    p.name.match(/Xcm|Cumulus|Parachain|Polkadot/i)
  );

  md += `### Hydration Core Pallets (${customPallets.length})\n\n`;
  for (const p of customPallets) {
    md += generatePalletSection(p);
  }

  md += `### System Pallets (${systemPallets.length})\n\n`;
  md += `<details>\n<summary>Click to expand</summary>\n\n`;
  for (const p of systemPallets) {
    md += generatePalletSection(p);
  }
  md += `</details>\n\n`;

  md += `### XCM Pallets (${xcmPallets.length})\n\n`;
  md += `<details>\n<summary>Click to expand</summary>\n\n`;
  for (const p of xcmPallets) {
    md += generatePalletSection(p);
  }
  md += `</details>\n\n`;

  return md;
}

function generatePalletSection(pallet: PalletMeta): string {
  let md = `#### ${pallet.name} (index: ${pallet.index})\n\n`;

  if (pallet.storage.length > 0) {
    md += `**Storage (${pallet.storage.length})**\n`;
    md += `| Name | Type |\n|------|------|\n`;
    for (const s of pallet.storage) {
      md += `| ${s.name} | \`${s.type}\` |\n`;
    }
    md += '\n';
  }

  if (pallet.calls.length > 0) {
    md += `**Calls (${pallet.calls.length})**\n`;
    md += `| Name | Args |\n|------|------|\n`;
    for (const c of pallet.calls) {
      const args = c.args.map(a => `${a.name}: ${a.type}`).join(', ') || 'none';
      md += `| ${c.name} | \`${args}\` |\n`;
    }
    md += '\n';
  }

  if (pallet.events.length > 0) {
    md += `**Events (${pallet.events.length})**\n`;
    md += `| Name | Fields |\n|------|--------|\n`;
    for (const e of pallet.events) {
      const fields = e.fields.map(f => `${f.name}: ${f.type}`).join(', ') || 'none';
      md += `| ${e.name} | \`${fields}\` |\n`;
    }
    md += '\n';
  }

  if (pallet.constants.length > 0) {
    md += `**Constants (${pallet.constants.length})**\n`;
    md += `| Name | Type |\n|------|------|\n`;
    for (const c of pallet.constants) {
      md += `| ${c.name} | \`${c.type}\` |\n`;
    }
    md += '\n';
  }

  return md;
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const network = (process.env.NETWORK || 'mainnet') as 'mainnet' | 'testnet';
  const outputPath = process.env.OUTPUT_PATH || './extractions/metadata';

  extractMetadata(network, outputPath)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Metadata extraction failed:', err);
      process.exit(1);
    });
}
