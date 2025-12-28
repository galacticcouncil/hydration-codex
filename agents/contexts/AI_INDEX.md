# Hydration AI Context Index

> Entry point for AI agents. Load this first, then follow links to specific layers.

## Critical: Read First

1. **[OPERATIONS.md](./OPERATIONS.md)** - Operational patterns and npm scripts
2. **[CANONICAL_IDS.md](./CANONICAL_IDS.md)** - Entity identification system and casing rules

## Project Status

**Current Phase**: Building Docusaurus knowledge base from extraction data.

**Key Files:**
- [OPERATIONS.md](./OPERATIONS.md) - **How to run commands (MUST READ)**
- [CROSS_REFERENCES.md](./CROSS_REFERENCES.md) - Cross-reference system
- [CONTEXT.md](../../CONTEXT.md) - Quick context (100 lines)

## Quick Start

```bash
npm run synthesize:all      # Run all synthesizers
npm run synthesize:pallets  # Generate pallet docs
npm run docs:build          # Build Docusaurus site
```

## Layer Documentation

| Layer | Doc | Description |
|-------|-----|-------------|
| L1 | [L1-runtime.md](./L1-runtime.md) | Pallets, storage, extrinsics, events |
| L2 | [L2-sdk.md](./L2-sdk.md) | SDK packages, methods, API calls |
| L3 | [L3-indexer.md](./L3-indexer.md) | GraphQL entities, event handlers |
| L4 | [L4-ui.md](./L4-ui.md) | Components, hooks, SDK/indexer usage |
| X-ref | [cross-refs.md](./cross-refs.md) | Cross-layer references, discrepancies |

## Architecture

```
L1: Runtime (Rust)     ──┐
                         ├──▶ L2: SDK (TypeScript)
    WASM Bridge        ──┘           │
                                     ▼
                            L3: Indexer (TypeScript)
                                     │
                                     ▼
                            L4: UI (React)
```

## Data Flow

- **L1 → L2**: SDK wraps runtime extrinsics, uses WASM math
- **L1 → L3**: Indexer listens to runtime events
- **L2 → L4**: UI calls SDK for transactions
- **L3 → L4**: UI queries indexer for data

## Agent Prompts

| Agent | Prompt | Use When |
|-------|--------|----------|
| Rust Archaeologist | `prompts/rust-archaeologist.md` | Analyzing L1 changes |
| SDK Analyst | `prompts/sdk-analyst.md` | Analyzing L2 changes |
| Data Cartographer | `prompts/data-cartographer.md` | Analyzing L3 changes |
| UI Analyst | `prompts/ui-analyst.md` | Analyzing L4 changes |
| Lead Architect | `prompts/lead-architect.md` | Cross-layer synthesis |

## Workflow

See [docs/ORCHESTRATION.md](../../docs/ORCHESTRATION.md) for full pipeline details.
