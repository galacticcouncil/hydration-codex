/**
 * Mermaid Diagram Generation from Chain Metadata
 *
 * Generates:
 * - ERD: Storage entity relationships
 * - Class: Pallet composition
 * - Flowchart: Call interactions
 */

import { join } from 'path';
import { createLogger } from '../utils/logger.js';
import { readJSON, writeFile } from '../utils/files.js';

const log = createLogger('diagrams');

interface PalletMeta {
  name: string;
  index: number;
  storage: { name: string; type: string; valueType: string }[];
  calls: { name: string; args: { name: string; type: string }[] }[];
  events: { name: string; fields: { name: string; type: string }[] }[];
  constants: { name: string; type: string }[];
}

interface RuntimeMeta {
  specName: string;
  specVersion: number;
  pallets: PalletMeta[];
}

// Core Hydration pallets for focused diagrams
const CORE_PALLETS = [
  'Omnipool', 'Stableswap', 'XYK', 'LBP', 'DCA', 'Router',
  'OmnipoolLiquidityMining', 'XYKLiquidityMining',
  'CircuitBreaker', 'Staking', 'Bonds', 'OTC', 'Referrals',
  'AssetRegistry', 'Tokens', 'Currencies',
];

export function generateERD(meta: RuntimeMeta): string {
  log.info('Generating ERD from metadata...');

  let erd = `erDiagram
    %% Hydration Protocol Storage Schema
    %% Generated from runtime v${meta.specVersion}

`;

  // Extract entities from core pallets
  const corePallets = meta.pallets.filter(p => CORE_PALLETS.includes(p.name));

  for (const pallet of corePallets) {
    if (pallet.storage.length === 0) continue;

    for (const storage of pallet.storage) {
      const entityName = `${pallet.name}_${storage.name}`.toUpperCase().replace(/[^A-Z0-9_]/g, '');

      // Parse value type to extract fields
      const fields = parseStorageFields(storage.valueType);

      erd += `    ${entityName} {\n`;
      for (const field of fields) {
        erd += `        ${field.type} ${field.name}\n`;
      }
      erd += `    }\n\n`;
    }
  }

  // Add relationships based on common patterns
  erd += `    %% Relationships
    OMNIPOOL_ASSETS ||--o{ OMNIPOOL_POSITIONS : "tracks"
    OMNIPOOL_POSITIONS ||--|| TOKENS_ACCOUNTS : "owner"
    ASSETREGISTRY_ASSETS ||--o{ OMNIPOOL_ASSETS : "registers"
    STABLESWAP_POOLS ||--o{ TOKENS_ACCOUNTS : "liquidity"
    DCA_SCHEDULES ||--|| OMNIPOOL_ASSETS : "trades"
    ROUTER_ROUTES ||--o{ OMNIPOOL_ASSETS : "routes_through"
`;

  return erd;
}

function parseStorageFields(valueType: string): { name: string; type: string }[] {
  const fields: { name: string; type: string }[] = [];

  // Parse JSON-like type definitions from metadata
  const matches = valueType.matchAll(/"(\w+)":\s*"([^"]+)"/g);
  for (const match of matches) {
    fields.push({
      name: match[1],
      type: simplifyType(match[2]),
    });
  }

  // If no fields found, treat as single value
  if (fields.length === 0) {
    fields.push({ name: 'value', type: simplifyType(valueType) });
  }

  return fields;
}

function simplifyType(type: string): string {
  // Simplify complex types for readability
  return type
    .replace(/AccountId32/g, 'address')
    .replace(/u128/g, 'uint128')
    .replace(/u64/g, 'uint64')
    .replace(/u32/g, 'uint32')
    .replace(/Permill/g, 'percent')
    .replace(/Perquintill/g, 'percent')
    .replace(/Vec<.*>/g, 'array')
    .replace(/Option<.*>/g, 'optional')
    .replace(/"[^"]*"/g, '');
}

export function generateClassDiagram(meta: RuntimeMeta): string {
  log.info('Generating class diagram...');

  let diagram = `classDiagram
    %% Hydration Runtime Composition
    %% Spec: ${meta.specName} v${meta.specVersion}

    class Runtime {
        +System
        +Balances
        +Assets
    }

`;

  // Add core pallets as classes
  const corePallets = meta.pallets.filter(p => CORE_PALLETS.includes(p.name));

  for (const pallet of corePallets) {
    diagram += `    class ${pallet.name} {\n`;
    diagram += `        <<pallet>>\n`;

    // Add storage as attributes
    for (const s of pallet.storage.slice(0, 5)) {
      diagram += `        +${s.name}\n`;
    }
    if (pallet.storage.length > 5) {
      diagram += `        +...${pallet.storage.length - 5} more\n`;
    }

    // Add key calls as methods
    for (const c of pallet.calls.filter(c => !c.name.startsWith('__')).slice(0, 5)) {
      diagram += `        +${c.name}()\n`;
    }
    diagram += `    }\n\n`;
  }

  // Add relationships
  diagram += `    %% Dependencies
    Runtime *-- Omnipool
    Runtime *-- Stableswap
    Runtime *-- XYK
    Runtime *-- LBP
    Runtime *-- DCA
    Runtime *-- Router
    Runtime *-- Staking

    Omnipool --> AssetRegistry : uses
    Omnipool --> Tokens : transfers
    Omnipool --> CircuitBreaker : limits
    Router --> Omnipool : routes
    Router --> Stableswap : routes
    Router --> XYK : routes
    DCA --> Router : executes
    Staking --> Tokens : rewards
    OmnipoolLiquidityMining --> Omnipool : incentivizes
`;

  return diagram;
}

export function generateFlowchart(meta: RuntimeMeta, palletName: string): string {
  log.info(`Generating flowchart for ${palletName}...`);

  const pallet = meta.pallets.find(p => p.name === palletName);
  if (!pallet) return `%% Pallet ${palletName} not found`;

  let flow = `flowchart TD
    %% ${palletName} Call Flow
    %% Generated from chain metadata

    subgraph ${palletName}["${palletName} Pallet"]
`;

  // Add calls as nodes
  const calls = pallet.calls.filter(c => !c.name.startsWith('__'));
  for (const call of calls) {
    const nodeId = call.name.replace(/_/g, '');
    const args = call.args.map(a => a.name).join(', ') || 'none';
    flow += `        ${nodeId}["${call.name}(${args})"]\n`;
  }

  flow += `    end\n\n`;

  // Add events
  if (pallet.events.length > 0) {
    flow += `    subgraph Events["Emitted Events"]\n`;
    for (const event of pallet.events) {
      const nodeId = `evt_${event.name}`;
      flow += `        ${nodeId}([${event.name}])\n`;
    }
    flow += `    end\n\n`;

    // Connect calls to events based on naming patterns
    for (const call of calls) {
      const matchingEvents = pallet.events.filter(e =>
        e.name.toLowerCase().includes(call.name.replace(/_/g, '').toLowerCase()) ||
        call.name.toLowerCase().includes(e.name.toLowerCase().replace('executed', ''))
      );
      for (const event of matchingEvents) {
        flow += `    ${call.name.replace(/_/g, '')} --> evt_${event.name}\n`;
      }
    }
  }

  return flow;
}

export function generateOmnipoolFlow(): string {
  return `flowchart TD
    %% Omnipool Trade Flow - The Golden Path
    %% Shows how a swap flows through the system

    User([User]) --> |"sell(assetIn, assetOut, amount)"| Router

    subgraph Router["Router Pallet"]
        route_sell["sell()"]
        route_sell --> |"find best route"| calculate_route
        calculate_route --> |"single hop"| direct_trade
        calculate_route --> |"multi hop"| split_trade
    end

    subgraph Omnipool["Omnipool Pallet"]
        sell_exec["sell()"]
        sell_exec --> check_tradable{Tradable?}
        check_tradable --> |No| error_not_tradable[Error: NotTradable]
        check_tradable --> |Yes| check_limits

        subgraph CircuitBreaker["Circuit Breaker"]
            check_limits{Within Limits?}
            check_limits --> |No| error_limit[Error: LimitExceeded]
        end

        check_limits --> |Yes| calculate_swap
        calculate_swap --> |"LRNA in"| hub_swap
        hub_swap --> |"LRNA out"| asset_swap
        asset_swap --> update_state
        update_state --> transfer_out
    end

    subgraph Tokens["Tokens Pallet"]
        transfer_out --> |"transfer assetOut"| recipient
    end

    direct_trade --> sell_exec
    split_trade --> sell_exec

    transfer_out --> emit_event([SellExecuted])
    emit_event --> broadcast([Broadcast.Swapped3])

    subgraph Indexer["Data Lake"]
        broadcast --> |"captured by"| squid_handler
        squid_handler --> |"stores"| postgres[(Trade Entity)]
    end

    postgres --> |"queries"| UI([Hydration UI])

    style Omnipool fill:#1a365d,color:#fff
    style CircuitBreaker fill:#c53030,color:#fff
    style Router fill:#2c5282,color:#fff
`;
}

export function generateXCMFlow(): string {
  return `sequenceDiagram
    %% XCM Cross-Chain Asset Transfer

    participant User
    participant SourceChain as Source Parachain
    participant Relay as Polkadot Relay
    participant Hydration
    participant Omnipool

    User->>SourceChain: xTokens.transfer(asset, amount, dest)
    SourceChain->>SourceChain: Lock/Burn asset
    SourceChain->>Relay: XCM: ReserveAssetDeposited
    Relay->>Hydration: XCM: ReceiveTeleportedAsset

    activate Hydration
    Hydration->>Hydration: Barrier Check
    Hydration->>Hydration: Weight Payment
    Hydration->>Hydration: AssetRegistry Lookup
    Hydration->>Hydration: Mint/Unlock asset
    deactivate Hydration

    alt Swap requested
        Hydration->>Omnipool: sell(receivedAsset, targetAsset)
        Omnipool-->>Hydration: SellExecuted
    end

    Hydration-->>User: Assets in wallet
`;
}

interface GenerateDiagramsOptions {
  metadataPath: string;
  outputPath: string;
}

export async function generateAllDiagrams(options: GenerateDiagramsOptions): Promise<void> {
  const { metadataPath, outputPath } = options;
  log.section('Generating Mermaid Diagrams');

  const meta = readJSON<RuntimeMeta>(join(metadataPath, 'metadata.json'));
  if (!meta) {
    throw new Error('Metadata not found. Run extract:metadata first.');
  }

  // Generate ERD
  const erd = generateERD(meta);
  writeFile(join(outputPath, 'storage-erd.mmd'), erd);
  log.success('Generated storage-erd.mmd');

  // Generate Class Diagram
  const classDiagram = generateClassDiagram(meta);
  writeFile(join(outputPath, 'runtime-classes.mmd'), classDiagram);
  log.success('Generated runtime-classes.mmd');

  // Generate Omnipool flowchart
  const omnipoolFlow = generateFlowchart(meta, 'Omnipool');
  writeFile(join(outputPath, 'omnipool-calls.mmd'), omnipoolFlow);
  log.success('Generated omnipool-calls.mmd');

  // Generate the "Golden Path" trade flow
  const tradeFlow = generateOmnipoolFlow();
  writeFile(join(outputPath, 'trade-flow.mmd'), tradeFlow);
  log.success('Generated trade-flow.mmd');

  // Generate XCM flow
  const xcmFlow = generateXCMFlow();
  writeFile(join(outputPath, 'xcm-flow.mmd'), xcmFlow);
  log.success('Generated xcm-flow.mmd');

  // Generate combined diagrams document
  const combined = `# Hydration Protocol Diagrams

> Generated from runtime v${meta.specVersion}

## Storage Entity Relationships

\`\`\`mermaid
${erd}
\`\`\`

## Runtime Pallet Composition

\`\`\`mermaid
${classDiagram}
\`\`\`

## Trade Flow (The Golden Path)

\`\`\`mermaid
${tradeFlow}
\`\`\`

## XCM Cross-Chain Flow

\`\`\`mermaid
${xcmFlow}
\`\`\`

## Omnipool Calls

\`\`\`mermaid
${omnipoolFlow}
\`\`\`
`;

  writeFile(join(outputPath, 'DIAGRAMS.md'), combined);
  log.success('Generated DIAGRAMS.md');

  log.section('Diagram Generation Complete');
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const metadataPath = process.env.METADATA_PATH || './extractions/metadata';
  const outputPath = process.env.OUTPUT_PATH || './docs/diagrams';

  generateAllDiagrams({ metadataPath, outputPath })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Diagram generation failed:', err);
      process.exit(1);
    });
}
