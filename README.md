# Hydration Codex

AI-powered living documentation system for the Hydration Protocol ecosystem.

## Architecture

```
L1: Runtime/Node    → hydration-node (Rust)        - Chain implementation
         ↓
L2: SDK             → @galacticcouncil/sdk (TS)    - Simplifies connecting to Runtime
         ↓
L3: Indexer         → hydration-data-lake (TS)     - Uses SDK + direct chain, simplifies data fetching
         ↓
L4: UI              → hydration-ui (React)         - Uses SDK + Indexer for end users
```

## Quick Start

```bash
# 1. Clone ecosystem repositories
./scripts/clone-repos.sh

# 2. Build Docker containers (for extraction tools)
docker compose build

# 3. Run extractions for each layer
# L1: Runtime
docker compose run --rm rust-env bash /tools/extract-runtime.sh

# L2: SDK
docker compose run --rm node-env bash /tools/extract-sdk.sh

# L3: Indexer
docker compose run --rm node-env bash /tools/extract-indexer.sh

# L4: UI
docker compose run --rm node-env bash /tools/extract-ui.sh

# 4. (Optional) Start dev node for live metadata
docker compose --profile with-node up -d hydration-node
docker compose run --rm rust-env bash /tools/extract-metadata.sh
```

## Directory Structure

```
hydration-codex/
├── docker-compose.yml       # Container orchestration
├── docker/
│   ├── rust/Dockerfile      # Rust + cargo-expand + subxt
│   └── node/Dockerfile      # Node.js + madge
├── repos/                   # Cloned repositories (L1→L4)
│   ├── hydration-node/      # L1: Runtime (main branch)
│   ├── sdk/                 # L2: SDK (main branch)
│   ├── indexer/             # L3: hydration-data-lake (develop branch)
│   └── hydration-ui/        # L4: UI (next branch)
├── knowledge-base/
│   ├── raw/                 # Extraction outputs
│   │   ├── runtime/         # L1: Expanded pallets, cargo tree
│   │   ├── sdk/             # L2: API calls, types, math
│   │   ├── indexer/         # L3: Schema, handlers, entities
│   │   └── ui/              # L4: Components, hooks
│   ├── processed/           # AI-ready chunks
│   └── cross-refs/          # Golden thread links
├── outputs/
│   ├── mermaid/             # Generated diagrams
│   ├── markdown/            # Documentation
│   └── reports/             # Discrepancy reports
├── tools/                   # Extraction scripts
├── scripts/                 # Helper scripts
└── agents/
    ├── prompts/             # Agent system prompts
    └── contexts/            # AI context files (AI_INDEX.md, OMNISCIENCE.md)
```

## Agent Roles

| Agent | Layers | Purpose |
|-------|--------|---------|
| Rust Archaeologist | L1 | Analyze expanded Rust macros, extract storage/extrinsics |
| Full-Stack Integrator | L2, L4 | Map SDK to runtime, SDK to UI, detect type drift |
| Data Cartographer | L3 | Analyze indexer schema/handlers, map events to entities |
| Lead Architect | L1→L4 | Cross-reference all layers, generate master docs |

## Data Sources

| Purpose | URL |
|---------|-----|
| Mainnet RPC | `wss://rpc.hydradx.cloud` |
| Block Explorer | `https://explorer.hydradx.cloud/graphql` |
| Pool Data (Squid) | `https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphql` |

## Using with Claude Code

```bash
# Start Claude Code in the project
cd ~/hydration-codex && claude

# Load AI context and ask questions
# Claude will use agents/contexts/AI_INDEX.md as entry point
```
