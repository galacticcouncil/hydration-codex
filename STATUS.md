# Codex Status

> Read this first for context.

## Current Phase: DEEP ARCHEOLOGY with BASELINE COMPARISON

## Extraction Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│  Option A: Live Chain                                           │
│  npm run extract:chain                                          │
│  - Connects to wss://rpc.hydradx.cloud                          │
│  - Extracts current metadata                                    │
│  - Compares against baseline                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Option B: Chopsticks Fork (for testing)                        │
│  1. npm run chopsticks         # Start forked mainnet locally   │
│  2. npm run extract:chain:local # Extract from fork             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Option C: Local Node (requires Rust)                           │
│  1. cd repos/hydration-node                                     │
│  2. cargo build --release                                       │
│  3. ./target/release/hydradx --dev                              │
│  4. npm run extract:chain:local                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Baseline Comparison

When running `npm run extract:chain`, it automatically:
1. Extracts current metadata from chain
2. Compares against `extractions/metadata/baseline.json`
3. Reports any changes (added/removed pallets, calls, events)

To update baseline after runtime upgrade:
```bash
npm run extract:chain:baseline
```

## Current Coverage (from chain metadata)

| Metric | Count |
|--------|-------|
| Pallets | 76 |
| Extrinsics | 371 |
| Events | 410 |
| Storage Items | 295 |

| Layer | Coverage |
|-------|----------|
| L1 Runtime | 100% (source of truth) |
| L2 SDK | ~2% (many calls not wrapped) |
| L3 Indexer | ~19% (many events not indexed) |
| L4 UI | ~13% |

## Key Commands

```bash
# Extraction
npm run extract:chain           # Extract from mainnet, compare to baseline
npm run extract:chain:baseline  # Save current as new baseline
npm run extract:chain:local     # Extract from local/chopsticks (port 8000)
npm run extract:metadata        # Full metadata with type definitions
npm run extract:diagrams        # Generate Mermaid diagrams

# Synthesis
npm run synthesize:deep         # Cross-layer coverage analysis

# Testing
npm run chopsticks              # Start chopsticks fork of mainnet
```

## Key Files

| File | Description |
|------|-------------|
| `extractions/metadata/baseline.json` | Saved baseline for comparison |
| `extractions/metadata/current.json` | Latest extraction |
| `extractions/metadata/DIFF.md` | Changes from baseline |
| `docs/DEEP_OMNISCIENCE.md` | Coverage + Golden Paths |
| `docs/diagrams/DIAGRAMS.md` | Mermaid ERD, class, flow |

## Building Local Node (requires Rust)

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup default stable
rustup target add wasm32-unknown-unknown

# Build node
cd repos/hydration-node
cargo build --release

# Run with dev chain
./target/release/hydradx --dev

# Or use chopsticks with local WASM
# Edit chopsticks.yml to add:
# wasm-override: ./repos/hydration-node/target/release/wbuild/hydradx-runtime/hydradx_runtime.wasm
```

## Last Updated
2025-12-26 - Added baseline comparison and chopsticks support
