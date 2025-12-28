# Cross-Reference Index Summary (v2)

Canonical ID-based mappings between all Hydration Protocol entities.

Generated: 2025-12-28T02:06:18.387Z
Version: 2.0.0

## ID Format

```
layer:type:Name[:type:Name...]

Examples:
  runtime:pallet:Omnipool:call:add_liquidity
  ui:hook:useAddLiquidity
  indexer:entity:OmnipoolAsset
```

## Statistics

### Entries by Layer

| Layer | Count |
|-------|-------|
| Runtime | 2031 |
| SDK | 31 |
| Indexer | 1458 |
| UI | 287 |

### Edges by Type

| Type | Count | Meaning |
|------|-------|---------|
| calls | 70 | Submits extrinsic |
| queries | 90 | Reads storage/data |
| handles | 118 | Processes event |
| reads | 0 | Reads from store |
| writes | 0 | Writes to store |
| uses | 51 | Generic dependency |
| contains | 3260 | Parent → child |

## Top Connected Pallets

| Pallet | UI Hooks | Indexer | Total |
|--------|----------|---------|-------|
| Omnipool | 12 | 23 | 35 |
| XYK | 15 | 16 | 31 |
| Stableswap | 15 | 15 | 30 |
| LBP | 9 | 10 | 19 |
| DCA | 1 | 12 | 13 |
| Utility | 12 | 0 | 12 |
| System | 11 | 0 | 11 |
| Staking | 11 | 0 | 11 |
| OmnipoolLiquidityMining | 7 | 3 | 10 |
| Router | 9 | 0 | 9 |
| OTC | 3 | 6 | 9 |
| EmaOracle | 7 | 1 | 8 |
| XYKLiquidityMining | 5 | 3 | 8 |
| HSM | 0 | 8 | 8 |
| Dispatcher | 6 | 1 | 7 |

## Usage

```typescript
import { parseCanonicalId, runtime, ui } from "./schemas/canonical-ids";

// Build IDs
const palletId = runtime.pallet("Omnipool");
const callId = runtime.call("Omnipool", "add_liquidity");
const hookId = ui.hook("useAddLiquidity");

// Parse IDs
const parsed = parseCanonicalId("runtime:pallet:Omnipool:call:add_liquidity");
// => { layer: "runtime", segments: [...] }
```

## References

- Schema: `src/schemas/canonical-ids.ts`
- Design: `proposals/canonical-ids.md`
- AI Guide: `agents/contexts/CANONICAL_IDS.md`
