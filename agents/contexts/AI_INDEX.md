# Hydration AI Context Index

> This file serves as the entry point for AI agents analyzing the Hydration ecosystem.
> Load this file first, then load specific context files as needed.

## Architecture Overview

```
L1: Runtime/Node        → hydration-node (Rust)
         ↓
L2: SDK                 → @galacticcouncil/sdk (TypeScript)
         ↓
L3: Indexer             → hydration-data-lake (Subsquid)
         ↓
L4: UI                  → hydration-ui (React)
```

**Data Flow:**
- **L1 Runtime:** Chain implementation, state transitions, events
- **L2 SDK:** Simplifies connecting to Runtime, math calculations, routing
- **L3 Indexer:** Uses SDK + direct chain connections, simplifies data fetching impossible for normal nodes
- **L4 UI:** Uses SDK (transactions) + Indexer (data) to serve end users

## Repository Map

| Layer | Repository | Branch | Language | Purpose |
|-------|------------|--------|----------|---------|
| L1 | hydration-node | main | Rust | Blockchain logic, state transitions |
| L1→L2 | hydration-wasm | main | Rust→WASM | Math functions for SDK (generated) |
| L2 | sdk | main | TypeScript | Client library, math, routing |
| L3 | hydration-data-lake | develop | TypeScript | Event indexing, data aggregation |
| L4 | hydration-ui | next | TypeScript/React | User interface |

## Agent Roster

| Agent | Role | Scope |
|-------|------|-------|
| lead-architect | Orchestrator | Synthesis, cross-refs, proposals |
| rust-archaeologist | L1 Extraction | Runtime, pallets, node, EVM |
| sdk-analyst | L2 Extraction | SDK packages, API methods, types |
| data-cartographer | L3 Extraction | Indexer schema, handlers, entities |
| ui-analyst | L4 Extraction | Components, hooks, SDK/Indexer usage |

## Context Files

### Runtime Contexts (L1)
- `runtime/omnipool.md` - Central liquidity pool logic
- `runtime/dca.md` - Dollar-cost averaging automation
- `runtime/stableswap.md` - Stablecoin swap mechanics
- `runtime/circuit-breaker.md` - Trade limit protections
- `runtime/asset-registry.md` - Asset management
- `runtime/xcm.md` - Cross-chain messaging

### SDK Contexts (L2)
- `sdk/trade-router.md` - Trade execution API
- `sdk/pool-service.md` - Liquidity pool queries
- `sdk/math-packages.md` - Pool math implementations

### Indexer Contexts (L3)
- `indexer/schema.md` - GraphQL schema
- `indexer/handlers.md` - Event processors
- `indexer/entities.md` - Data models

### UI Contexts (L4)
- `ui/trade-form.md` - Swap interface
- `ui/liquidity.md` - LP management
- `ui/portfolio.md` - User positions

## Quick Reference

### Key Types
```
AssetId: u32
Balance: u128
AccountId: [u8; 32] (SS58 encoded)
Price: FixedU128 (18 decimals)
```

### Key Storage Items
- `Omnipool::Assets` - Per-asset liquidity state
- `Omnipool::HubAssetState` - LRNA hub token state
- `Omnipool::Positions` - LP position NFTs
- `AssetRegistry::Assets` - Asset metadata

### Key Extrinsics
- `omnipool.sell(asset_in, asset_out, amount, min_buy_amount)`
- `omnipool.buy(asset_out, asset_in, amount, max_sell_amount)`
- `omnipool.add_liquidity(asset, amount)`
- `omnipool.remove_liquidity(position_id, amount)`

### Key Events
- `Omnipool::SellExecuted`
- `Omnipool::BuyExecuted`
- `Omnipool::LiquidityAdded`
- `Omnipool::LiquidityRemoved`

## Data Sources

### Indexer Endpoints (for UI)
| Purpose | URL |
|---------|-----|
| Block Explorer | `https://explorer.hydradx.cloud/graphql` |
| Pool Data | `https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphql` |

### RPC Endpoints
| Network | URL |
|---------|-----|
| Mainnet | `wss://rpc.hydradx.cloud` |
| Paseo Testnet | `wss://paseo-rpc.hydradx.io` |

## Cross-Reference Patterns

When analyzing a feature, trace through all layers:
1. **L1 Runtime**: What extrinsic? What storage? What events emitted?
2. **L2 SDK**: What method wraps this? What math calculations?
3. **L3 Indexer**: What events captured? What entities created? What aggregations?
4. **L4 UI**: What component? Uses SDK for what? Uses Indexer for what?

## Version Info
- Runtime: `spec_version` from metadata
- SDK: `package.json` version (monorepo at `packages/sdk`)
- Indexer: `package.json` in `indexers/liquidity-pools/`
- UI: `package.json` version (branch: next)
