# Canonical ID System

> Design proposal for a universal identification system across all Hydration Protocol layers.

## Problem

Current ID system is inconsistent and brittle:
- Mixed formats: `runtime:Omnipool` vs `runtime:Omnipool.add_liquidity`
- File-based hacks: `FILE_TO_PALLETS` mapping guesses relationships from file paths
- No hierarchy: Can't navigate from item → parent → layer
- Breaks when files move or rename

## Solution

A hierarchical canonical ID system where:
1. Every entity has exactly one canonical identifier
2. IDs reflect code structure, not file paths
3. Relationships are traced from actual code, not guessed

## ID Format

```
layer:type:Name[:type:Name...]
```

### Segments

| Segment | Casing | Description |
|---------|--------|-------------|
| `layer` | lowercase | Top-level layer: `runtime`, `sdk`, `indexer`, `ui` |
| `type` | lowercase | Entity type within layer: `pallet`, `storage`, `call`, `hook`, etc. |
| `Name` | **preserved** | Actual name from source code, preserving original casing |

### Why Preserve Name Casing?

- **Exact match**: IDs map directly to source code identifiers
- **No ambiguity**: `Omnipool` is clearly the Rust struct, not a transformed version
- **Developer recognition**: Names look familiar to developers in each ecosystem

## Layer Schemas

### Runtime (Substrate/Rust)

Source casing conventions:
- Pallet names: `PascalCase` (Omnipool, AssetRegistry)
- Storage names: `PascalCase` (Assets, Positions)
- Call names: `snake_case` (add_liquidity, swap)
- Event names: `PascalCase` (LiquidityAdded, Swapped)
- Error names: `PascalCase` (InsufficientBalance)
- Constant names: `PascalCase` (MinTradingLimit)

```
runtime:pallet:Omnipool
runtime:pallet:Omnipool:storage:Assets
runtime:pallet:Omnipool:storage:HubAssetId
runtime:pallet:Omnipool:call:add_liquidity
runtime:pallet:Omnipool:call:sell
runtime:pallet:Omnipool:event:LiquidityAdded
runtime:pallet:Omnipool:event:SellExecuted
runtime:pallet:Omnipool:error:InsufficientBalance
runtime:pallet:Omnipool:const:MinTradingLimit
```

### SDK (TypeScript)

Source casing conventions:
- Package names: `kebab-case` (sdk-core, sdk-api)
- Method names: `camelCase` (getPools, getBestSell)
- Namespaced methods: `camelCase.camelCase` (router.getPools)

```
sdk:package:sdk-core
sdk:package:sdk-core:method:createClient
sdk:package:sdk-api
sdk:package:sdk-api:method:router.getPools
sdk:package:sdk-api:method:router.getBestSell
sdk:package:sdk-api:method:pools.getOmnipoolAssets
```

### Indexer (Subsquid/GraphQL)

Source casing conventions:
- Entity names: `PascalCase` (OmnipoolAsset, StableswapPool)
- Field names: `camelCase` (assetId, hubReserve)
- Handler names: `camelCase` (handleSwap, handleLiquidityAdded)

```
indexer:entity:OmnipoolAsset
indexer:entity:OmnipoolAsset:field:assetId
indexer:entity:OmnipoolAsset:field:hubReserve
indexer:handler:handleOmnipoolSwap
indexer:handler:handleLiquidityAdded
```

### UI (React/TypeScript)

Source casing conventions:
- Hook names: `camelCase` with `use` prefix (useAddLiquidity, useSwap)
- Component names: `PascalCase` (SwapForm, LiquidityPanel)

```
ui:hook:useAddLiquidity
ui:hook:useOmnipoolAssets
ui:hook:useSwap
ui:component:SwapForm
ui:component:LiquidityPanel
```

## Relationship Tracing

Instead of guessing from file paths, trace actual code dependencies:

### UI → SDK (from UI extraction)

```typescript
// UI code
const result = await sdk.api.router.getBestSell(...)
```

Extracted relationship:
```
ui:hook:useSwap --calls--> sdk:package:sdk-api:method:router.getBestSell
```

### UI → Runtime (from UI extraction)

```typescript
// Direct runtime calls in UI
await api.tx.Omnipool.addLiquidity(...)
await api.query.Omnipool.assets(...)
```

Extracted relationships:
```
ui:hook:useAddLiquidity --calls--> runtime:pallet:Omnipool:call:add_liquidity
ui:hook:useOmnipoolAssets --queries--> runtime:pallet:Omnipool:storage:Assets
```

### SDK → Runtime (from SDK extraction)

```typescript
// Inside SDK method
async getPools() {
  const routes = await api.query.Router.routes();
  const xykPools = await api.query.XYK.poolAssets.entries();
  // ...
}
```

Extracted relationships:
```
sdk:package:sdk-api:method:router.getPools --queries--> runtime:pallet:Router:storage:Routes
sdk:package:sdk-api:method:router.getPools --queries--> runtime:pallet:XYK:storage:PoolAssets
```

### Indexer → Runtime (from Indexer extraction)

```typescript
// Handler processes runtime events
processor.addEventHandler('Omnipool.LiquidityAdded', handleLiquidityAdded)
```

Extracted relationship:
```
indexer:handler:handleLiquidityAdded --handles--> runtime:pallet:Omnipool:event:LiquidityAdded
```

## Edge Types

Relationships have semantic types:

| Edge Type | From | To | Meaning |
|-----------|------|-----|---------|
| `calls` | ui/sdk | runtime:call | Submits extrinsic |
| `queries` | ui/sdk | runtime:storage | Reads storage |
| `handles` | indexer | runtime:event | Processes event |
| `reads` | ui:hook | ui:store | Reads from state container |
| `writes` | ui:hook | ui:store | Writes to state container |
| `uses` | any | any | Generic dependency |
| `contains` | parent | child | Hierarchical containment |

## Reactive Data Flow

Modern React apps use state management (Zustand, Jotai, Redux, etc.) where:
- **Stores** hold reactive state
- **Populators** write data to stores (often from runtime calls)
- **Consumers** read data from stores

### The Problem

```
useAccountBalance (consumer hook)
  └─ reads from useAccountData (Zustand store)
       └─ populated by useAccountBalanceSubscription (populator hook)
            └─ calls papi.query.Tokens.Accounts (runtime)
```

Without modeling stores, `useAccountBalance` appears to have no runtime dependencies.

### The Solution

Model stores as first-class entities with `reads`/`writes` edges:

```typescript
// Store entity
entries["ui:store:useAccountData"] = {
  id: "ui:store:useAccountData",
  layer: "ui",
  type: "store",
  name: "useAccountData"
}

// Edges capture the data flow
edges: [
  // Consumer reads from store
  { from: "ui:hook:useAccountBalance", to: "ui:store:useAccountData", type: "reads" },

  // Populator writes to store
  { from: "ui:hook:useAccountBalanceSubscription", to: "ui:store:useAccountData", type: "writes" },

  // Populator calls runtime
  { from: "ui:hook:useAccountBalanceSubscription", to: "runtime:storage:Tokens:Accounts", type: "queries" }
]
```

### Runtime Call Propagation

With stores modeled, we can propagate runtime calls through the graph:

```
Query: "What runtime calls power useAccountBalance?"

1. Find stores that useAccountBalance reads from
   → ui:store:useAccountData

2. Find hooks that write to those stores
   → ui:hook:useAccountBalanceSubscription

3. Get runtime calls from those hooks
   → runtime:storage:Tokens:Accounts
   → runtime:storage:System:Account

4. Attribute to consumer
   → useAccountBalance uses Tokens.Accounts, System.Account (via store)
```

### UI Entity Types

| Type | Casing | Description | Example |
|------|--------|-------------|---------|
| `hook` | camelCase with `use` prefix | React hook | `useAddLiquidity` |
| `component` | PascalCase | React component | `SwapForm` |
| `store` | camelCase with `use` prefix | State container (Zustand/Jotai/etc) | `useAccountData` |

### Store Detection Patterns

The static analyzer detects stores by looking for:

1. **Zustand**: `create<T>()` with setter functions
2. **Jotai**: `atom()` definitions
3. **Redux**: `createSlice()` or `createStore()`
4. **React Query**: Query key patterns (future)

### Visualization

The data flow forms a directed graph:

```
┌─────────────────────────────────────────────────────────────┐
│                         Runtime                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │Tokens.Accounts│  │System.Account│  │Balances.Locks│       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │ queries         │ queries         │ queries
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      Populator Hook                          │
│            useAccountBalanceSubscription                     │
│                          │                                   │
│                          │ writes                            │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Store                              │    │
│  │              useAccountData                          │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                          │ reads                             │
│          ┌───────────────┼───────────────┐                  │
│          ▼               ▼               ▼                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │useAccountBal │ │useAccountFees│ │useAccountPos │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                    Consumer Hooks                            │
└─────────────────────────────────────────────────────────────┘
```

### Querying the Graph

Both directions are efficient with edge-based storage:

```typescript
// Forward: What does this hook depend on?
function getDependencies(hookId: string): string[] {
  return edges
    .filter(e => e.from === hookId)
    .map(e => e.to);
}

// Reverse: What depends on this store?
function getDependents(storeId: string): string[] {
  return edges
    .filter(e => e.to === storeId)
    .map(e => e.from);
}

// Transitive: All runtime calls (direct + via stores)
function getAllRuntimeCalls(hookId: string): string[] {
  const direct = edges
    .filter(e => e.from === hookId && e.to.startsWith('runtime:'))
    .map(e => e.to);

  const viaStores = edges
    .filter(e => e.from === hookId && e.type === 'reads')
    .flatMap(e => {
      const writers = edges.filter(w => w.to === e.to && w.type === 'writes');
      return writers.flatMap(w => getAllRuntimeCalls(w.from));
    });

  return [...new Set([...direct, ...viaStores])];
}
```

## ID Utilities

### Parsing

```typescript
parseCanonicalId("runtime:pallet:Omnipool:call:add_liquidity")
// => { layer: "runtime", segments: [
//      { type: "pallet", name: "Omnipool" },
//      { type: "call", name: "add_liquidity" }
//    ]}
```

### Building

```typescript
buildCanonicalId("runtime", [
  { type: "pallet", name: "Omnipool" },
  { type: "call", name: "add_liquidity" }
])
// => "runtime:pallet:Omnipool:call:add_liquidity"
```

### Parent extraction

```typescript
getParent("runtime:pallet:Omnipool:call:add_liquidity")
// => "runtime:pallet:Omnipool"

getParent("runtime:pallet:Omnipool")
// => null (top-level within layer)
```

### Layer extraction

```typescript
getLayer("runtime:pallet:Omnipool:call:add_liquidity")
// => "runtime"
```

## Migration Path

1. **Phase 1**: Define schema and utilities (`src/schemas/canonical-ids.ts`)
2. **Phase 2**: Update runtime extractor to emit canonical IDs
3. **Phase 3**: Update SDK extractor to trace method → runtime relationships
4. **Phase 4**: Update indexer extractor to link handlers → events
5. **Phase 5**: Update UI extractor (already captures `tx.*`, `query.*`)
6. **Phase 6**: Rebuild crossref using canonical IDs, remove file-based hacks
7. **Phase 7**: Update synthesizers to use new ID format for links

## Benefits

1. **Single source of truth**: One canonical way to identify anything
2. **Hierarchical navigation**: Drill down or roll up naturally
3. **Code-based relationships**: Traced from actual code, not file paths
4. **URL-friendly**: IDs can map directly to documentation routes
5. **Searchable**: Consistent format enables reliable search/grep
6. **Extensible**: Easy to add new types or layers
