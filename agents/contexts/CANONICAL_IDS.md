# Canonical ID System Reference

> Universal identification system for all Hydration Protocol entities.

## Quick Reference

### Format
```
layer:type:Name[:type:Name...]
```

- `layer` and `type` are always **lowercase**
- `Name` preserves **original casing** from source code

### Examples

```
runtime:pallet:Omnipool
runtime:pallet:Omnipool:storage:Assets
runtime:pallet:Omnipool:call:add_liquidity
runtime:pallet:Omnipool:event:LiquidityAdded

sdk:package:sdk-api
sdk:package:sdk-api:method:router.getPools

indexer:entity:OmnipoolAsset
indexer:entity:OmnipoolAsset:field:assetId
indexer:handler:handleSwap

ui:hook:useAddLiquidity
ui:component:SwapForm
```

## Layers and Types

| Layer | Types | Name Casing (from source) |
|-------|-------|---------------------------|
| `runtime` | `pallet`, `storage`, `call`, `event`, `error`, `const` | PascalCase (except `call` = snake_case) |
| `sdk` | `package`, `method` | kebab-case / camelCase |
| `indexer` | `entity`, `field`, `handler` | PascalCase / camelCase |
| `ui` | `hook`, `component` | camelCase / PascalCase |

## Casing Rules

### Runtime (Rust/Substrate)
| Type | Casing | Example |
|------|--------|---------|
| pallet | PascalCase | `Omnipool`, `AssetRegistry` |
| storage | PascalCase | `Assets`, `HubAssetId` |
| call | snake_case | `add_liquidity`, `sell` |
| event | PascalCase | `LiquidityAdded`, `Swapped` |
| error | PascalCase | `InsufficientBalance` |
| const | PascalCase | `MinTradingLimit` |

### SDK (TypeScript)
| Type | Casing | Example |
|------|--------|---------|
| package | kebab-case | `sdk-core`, `sdk-api` |
| method | camelCase (dotted) | `getPools`, `router.getBestSell` |

### Indexer (GraphQL/TypeScript)
| Type | Casing | Example |
|------|--------|---------|
| entity | PascalCase | `OmnipoolAsset`, `StableswapPool` |
| field | camelCase | `assetId`, `hubReserve` |
| handler | camelCase | `handleSwap` |

### UI (React/TypeScript)
| Type | Casing | Example |
|------|--------|---------|
| hook | camelCase (use prefix) | `useAddLiquidity`, `useSwap` |
| component | PascalCase | `SwapForm`, `LiquidityPanel` |
| store | camelCase (use prefix) | `useAccountData`, `useTradeSettings` |

## Edge Types (Relationships)

| Type | From → To | Meaning |
|------|-----------|---------|
| `calls` | ui/sdk → runtime:call | Submits extrinsic |
| `queries` | ui/sdk → runtime:storage | Reads storage |
| `handles` | indexer:handler → runtime:event | Processes event |
| `reads` | ui:hook → ui:store | Reads from state container |
| `writes` | ui:hook → ui:store | Writes to state container |
| `uses` | any → any | Generic dependency |
| `contains` | parent → child | Hierarchical |

## Reactive Data Flow (Stores)

Hooks may read from stores that are populated by other hooks. This creates a data flow chain:

```
useAccountBalance (consumer)
  └── reads ──→ useAccountData (store)
                      ↑
              writes ─┘
  useAccountBalanceSubscription (populator)
        └── queries ──→ runtime:storage:Tokens:Accounts
```

### Store Entities

```
ui:store:useAccountData
ui:store:useTradeSettings
ui:store:useDisplayAssetStore
```

### Store Edges

```typescript
// Consumer reads from store
{ from: "ui:hook:useAccountBalance", to: "ui:store:useAccountData", type: "reads" }

// Populator writes to store
{ from: "ui:hook:useAccountBalanceSubscription", to: "ui:store:useAccountData", type: "writes" }
```

### Propagating Runtime Calls

To find ALL runtime calls for a hook (including via stores):

1. Get direct runtime calls from the hook
2. Find stores the hook reads from (`reads` edges)
3. Find hooks that write to those stores (`writes` edges)
4. Get runtime calls from writer hooks (recursively)

```typescript
function getAllRuntimeCalls(hookId: string, edges: Edge[]): string[] {
  // Direct calls
  const direct = edges
    .filter(e => e.from === hookId && e.to.startsWith('runtime:'))
    .map(e => e.to);

  // Via stores
  const stores = edges.filter(e => e.from === hookId && e.type === 'reads');
  const viaStores = stores.flatMap(store => {
    const writers = edges.filter(e => e.to === store.to && e.type === 'writes');
    return writers.flatMap(w => getAllRuntimeCalls(w.from, edges));
  });

  return [...new Set([...direct, ...viaStores])];
}
```

## Utilities

### Parse ID
```typescript
import { parseCanonicalId } from '../schemas/canonical-ids';

parseCanonicalId("runtime:pallet:Omnipool:call:add_liquidity")
// => { layer: "runtime", segments: [
//      { type: "pallet", name: "Omnipool" },
//      { type: "call", name: "add_liquidity" }
//    ]}
```

### Build ID
```typescript
import { runtime, sdk, ui } from '../schemas/canonical-ids';

runtime.pallet("Omnipool")                    // runtime:pallet:Omnipool
runtime.call("Omnipool", "add_liquidity")     // runtime:pallet:Omnipool:call:add_liquidity
sdk.method("sdk-api", "router.getPools")      // sdk:package:sdk-api:method:router.getPools
ui.hook("useAddLiquidity")                    // ui:hook:useAddLiquidity
```

### Get Parent
```typescript
import { getParentId } from '../schemas/canonical-ids';

getParentId("runtime:pallet:Omnipool:call:add_liquidity")
// => "runtime:pallet:Omnipool"
```

## Key Principles

1. **One canonical ID per entity** - No ambiguity
2. **Code-based, not file-based** - IDs reflect code structure
3. **Preserve source casing** - Names match source code exactly
4. **Hierarchical** - Navigate up/down the tree
5. **Layer separation** - Clear boundaries between layers

## Source Files

- Schema: `src/schemas/canonical-ids.ts`
- Design doc: `proposals/canonical-ids.md`
