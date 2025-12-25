# OMNISCIENCE: The Hydration Golden Thread

> Master cross-reference document linking all ecosystem components.
> This document is auto-generated from extraction outputs.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ L1: RUNTIME/NODE (Source of Truth)                              │
│     hydration-node/runtime/hydradx                              │
│     Rust pallets, state transitions, on-chain logic, events     │
│     └── math/ (pool calculations, fixed-point arithmetic)       │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌─────────────────────────┐   ┌─────────────────────────────────┐
│ hydration-wasm          │   │ Polkadot.js types               │
│ (GENERATED)             │   │ (chain metadata)                │
│ Rust math → WASM        │   │                                 │
│ For client-side calcs   │   │                                 │
└─────────────────────────┘   └─────────────────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ L2: SDK (Driver Layer)                                          │
│     @galacticcouncil/sdk                                        │
│     TypeScript API wrapper, routing, transaction building       │
│     Uses: hydration-wasm for math, metadata for types           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ L3: INDEXER (Data Layer)                                        │
│     hydration-data-lake (Subsquid)                              │
│     Uses SDK + direct chain connections                         │
│     Simplifies data fetching impossible for normal nodes        │
│     Aggregations, historical data, fast queries                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ L4: UI (User Interface)                                         │
│     hydration-ui                                                │
│     Uses SDK for: transactions, price calculations              │
│     Uses Indexer for: charts, history, aggregated stats         │
└─────────────────────────────────────────────────────────────────┘
```

**Key Insight:** Indexer sits between SDK and UI, providing data that's impossible to fetch efficiently from a normal node (aggregations, historical queries, complex joins).

---

## Feature: Omnipool Trading

### The Flow
```
User clicks "Swap" → TradeForm.tsx → useTradeExecutor hook
    → TradeRouter.sell() → api.tx.omnipool.sell()
    → Runtime executes → SellExecuted event emitted
    → Indexer captures → Trade entity created (for history/charts)
    → UI subscribes → Balance updates shown
```

### Layer Details

#### L1: Runtime (Truth)
| Aspect | Value |
|--------|-------|
| Pallet | `pallet-omnipool` |
| Extrinsic | `sell(asset_in: AssetId, asset_out: AssetId, amount: Balance, min_buy_amount: Balance)` |
| Storage Read | `Assets`, `HubAssetState` |
| Storage Write | `Assets` (both assets), `HubAssetState` |
| Events | `SellExecuted { who, asset_in, asset_out, amount_in, amount_out, ... }` |
| Errors | `InsufficientBalance`, `AssetNotFound`, `SlippageExceeded`, `TradeLimitReached` |

#### L2: SDK
| Aspect | Value |
|--------|-------|
| Class | `TradeRouter` |
| Method | `getBestSell(assetIn, assetOut, amountIn)` |
| File | `packages/sdk/src/api/tradeRouter.ts` |
| Returns | `{ amountOut, spotPrice, priceImpact, route }` |

#### L3: Indexer
| Aspect | Value |
|--------|-------|
| Repo | `hydration-data-lake/indexers/liquidity-pools` |
| Handler | Event handler for `Omnipool.SellExecuted` |
| Entity | `Trade` |
| Purpose | Trade history, charts, volume aggregations |
| Endpoint | `galacticcouncil.squids.live/hydration-pools:unified-prod` |

#### L4: UI
| Aspect | Value |
|--------|-------|
| Component | `<TradeForm />` |
| Hook | `useTradeExecutor` |
| State | `tokenIn`, `tokenOut`, `amountIn`, `amountOut` |
| File | `src/sections/trade/TradeForm.tsx` |
| Uses SDK | Transaction building, price calculation |
| Uses Indexer | Trade history display, charts |

---

## Feature: Add Liquidity

### The Flow
```
User enters amount → LiquidityForm.tsx → useAddLiquidity hook
    → api.tx.omnipool.addLiquidity()
    → Runtime mints position NFT → LiquidityAdded event
    → Indexer captures → LiquidityChange entity (for history)
    → UI shows new position
```

### Layer Details

#### L1: Runtime
| Aspect | Value |
|--------|-------|
| Extrinsic | `add_liquidity(asset: AssetId, amount: Balance)` |
| Storage Write | `Positions` (new NFT), `Assets` (update liquidity) |
| Events | `LiquidityAdded { who, asset_id, amount, position_id }` |
| Returns | `position_id: u128` (NFT ID) |

#### L2: SDK
| Method | `OmnipoolService.addLiquidity(asset, amount)` |

#### L3: Indexer
| Entity | `LiquidityChange`, `OmnipoolPosition` |
| Purpose | LP position history, TVL tracking |

#### L4: UI
| Component | `<AddLiquidityForm />` |
| Uses SDK | Transaction building |
| Uses Indexer | Position history, pool stats |

---

## Feature: DCA (Dollar Cost Averaging)

### The Flow
```
User creates schedule → DCAForm.tsx → api.tx.dca.schedule()
    → Runtime stores order → Scheduled event
    → Each block: on_initialize checks → Executes if ready
    → Executed event → Indexer updates DCAOrder status
```

### Layer Details

#### L1: Runtime
| Aspect | Value |
|--------|-------|
| Pallet | `pallet-dca` |
| Extrinsic | `schedule(order: Order<...>, schedule: Schedule)` |
| Hook | `on_initialize` - checks and executes pending orders |
| Events | `Scheduled`, `Executed`, `Terminated` |

---

## Data Sources

### Indexer Endpoints (Used by UI)
| Purpose | URL |
|---------|-----|
| Block Explorer | `https://explorer.hydradx.cloud/graphql` |
| Pool Data (Squid) | `https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphql` |

### Direct Chain RPC
| Network | URL |
|---------|-----|
| Mainnet | `wss://rpc.hydradx.cloud` |
| Testnet (Paseo) | `wss://paseo-rpc.hydradx.io` |

---

## Discrepancy Flags

> Items requiring attention

### SDK-RUNTIME Mismatches
- [ ] **TODO**: Verify SDK exposes all extrinsic parameters
- [ ] **TODO**: Check type mappings match metadata

### UI-SDK Inconsistencies
- [ ] **TODO**: Verify form validations match SDK limits
- [ ] **TODO**: Check error message mappings

### UI-Indexer Dependencies
- [ ] **TODO**: Document which UI features require indexer
- [ ] **TODO**: Identify fallbacks when indexer unavailable

---

## Last Updated
- Runtime extraction: `<TIMESTAMP>`
- SDK extraction: `<TIMESTAMP>`
- UI extraction: `<TIMESTAMP>`
