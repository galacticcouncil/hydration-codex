# Hydration Codex

A living documentation system for the Hydration Protocol ecosystem.

The Codex automatically extracts knowledge from all layers of the Hydration stack, finds gaps and inconsistencies between them, and generates reference documentation. Think of it as an always-up-to-date map of how the entire system fits together.

## What It Does

Hydration's stack spans 4 layers: blockchain runtime (Rust), SDK (TypeScript), indexer (GraphQL), and UI (React). Changes in one layer often require changes in others, but tracking these dependencies manually is error-prone.

The Codex solves this by:
- **Extracting** structured data from each layer's source code
- **Synthesizing** cross-references to show how features flow through the stack
- **Generating** reference documentation for pallets, SDK, indexer, and UI hooks
- **Providing** AI-optimized context files for developers working with AI assistants

## The Stack

```
┌─────────────────────────────────────────────────────────────────┐
│  L1: Runtime (Rust)                                             │
│  hydration-node → 76 pallets, 371 extrinsics, 410 events        │
└────────────────────────────┬────────────────────────────────────┘
                             │ wraps
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  L2: SDK (TypeScript)                                           │
│  @galacticcouncil/sdk → 20 packages, 245 methods                │
└────────────────────────────┬────────────────────────────────────┘
                             │ uses
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  L3: Indexer (TypeScript/GraphQL)                               │
│  hydration-data-lake → 123 entities, event handlers             │
└────────────────────────────┬────────────────────────────────────┘
                             │ queries
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  L4: UI (React)                                                 │
│  hydration-ui → 226 hooks, components                           │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Clone with all ecosystem repos as submodules
git clone --recursive https://github.com/galacticcouncil/hydration-codex.git
cd hydration-codex

# Install dependencies
npm install

# Build everything
npm run docs:full
```

This will:
1. Extract data from all 4 layers → `extractions/`
2. Generate cross-references and documentation → `docs-site/`
3. Build the Docusaurus site

For a faster start, see [QUICKSTART.md](QUICKSTART.md).

## What's Working

| Feature | Status | Command |
|---------|--------|---------|
| Runtime extraction (76 pallets) | Done | `npm run extract:runtime` |
| SDK extraction (20 packages) | Done | `npm run extract:sdk` |
| Indexer extraction (123 entities) | Done | `npm run extract:indexer` |
| UI extraction (226 hooks) | Done | `npm run extract:ui` |
| Cross-layer references | Done | `npm run synthesize:crossref` |
| Pallet reference docs | Done | `npm run synthesize:pallets` |
| SDK reference docs | Done | `npm run synthesize:sdk` |
| Indexer reference docs | Done | `npm run synthesize:indexer` |
| UI hooks reference docs | Done | `npm run synthesize:hooks` |
| AI data files (JSON) | Done | `npm run synthesize:ai` |
| Docusaurus site | Done | `npm run docs:build` |

## WIP / Future

| Feature | Description |
|---------|-------------|
| AI descriptions | Fill in `<!-- AI_DESCRIPTION -->` placeholders with generated content |
| Feature-level docs | Curated documentation explaining user-facing features |
| Proposal automation | Auto-generate PRs from gap analysis |
| Chain metadata diffing | Track runtime upgrades via `npm run extract:chain` |

## The Pipeline

### Step 1: Extract

```bash
npm run extract:all       # All layers
npm run extract:runtime   # Just runtime (L1)
npm run extract:sdk       # Just SDK (L2)
npm run extract:indexer   # Just indexer (L3)
npm run extract:ui        # Just UI (L4)
```

Each extraction:
- Parses source code (AST for TypeScript, regex for Rust)
- Outputs structured JSON to `extractions/<layer>/<commit>.json`
- Reuses existing extraction if repo commit matches

### Step 2: Synthesize

```bash
npm run synthesize:all      # All synthesizers
npm run synthesize:crossref # Cross-layer references
npm run synthesize:pallets  # Pallet documentation
npm run synthesize:sdk      # SDK documentation
npm run synthesize:indexer  # Indexer documentation
npm run synthesize:hooks    # UI hooks documentation
npm run synthesize:ai       # AI data files (JSON)
```

Reads extractions and:
- Builds cross-references (UI hook → SDK method → pallet call)
- Generates MDX reference pages for Docusaurus
- Creates AI-optimized JSON files for agent consumption

### Step 3: Build

```bash
npm run docs:dev          # Start dev server (hot reload)
npm run docs:build        # Build production site
npm run docs:serve        # Serve production build
npm run docs:full         # Full pipeline + build
npm run docs:refresh      # Skip extraction, rebuild docs
```

## Documentation Site

The Codex generates a full Docusaurus site at `docs-site/`:

- **Reference** - Auto-generated pages for all 76 pallets, 20 SDK packages, 123 indexer entities, 226 UI hooks
- **AI & Agents** - Context files for AI assistants with token budget guidance

## AI Context Files

Two types of context for AI assistants:

### Markdown (Human-Guided AI)
Load into AI context window for background knowledge:
- `agents/contexts/OMNISCIENCE.md` (~8K tokens) - Full stack overview
- `agents/contexts/L1-runtime.md` (~3K tokens) - All pallets
- `agents/contexts/L2-sdk.md` (~1K tokens) - SDK packages
- `agents/contexts/L3-indexer.md` (~17K tokens) - Indexer entities
- `agents/contexts/L4-ui.md` (~23K tokens) - UI hooks

### JSON (Programmatic AI)
For AI agents and tools:
- `/ai/ai-manifest.json` (~500 tokens) - File index
- `/ai/runtime-index.json` (~3K tokens) - Pallet listing
- `/ai/ui-index.json` (~2K tokens) - Hooks by category
- `/ai/xref-ui-runtime.json` (~3K tokens) - UI → Runtime mapping
- `/ai/xref-edges.json` (~10K tokens) - All cross-references

## Extraction Caching

Extractions are keyed by commit hash:
```
extractions/runtime/4ca470c.json
extractions/runtime/latest -> 4ca470c.json
```

Running `npm run extract:*` reuses existing extractions if the commit hasn't changed.

## Directory Structure

```
hydration-codex/
├── repos/                      # Git submodules (source code)
│   ├── hydration-node/         # L1: Runtime
│   ├── sdk/                    # L2: SDK
│   ├── indexer/                # L3: Indexer
│   └── hydration-ui/           # L4: UI
│
├── extractions/                # Extraction outputs (by commit)
│   ├── runtime/
│   ├── sdk/
│   ├── indexer/
│   └── ui/
│
├── docs-site/                  # Docusaurus documentation site
│   ├── docs/                   # Generated MDX pages
│   │   ├── reference/          # Pallets, SDK, Indexer, Hooks
│   │   └── ai/                 # AI usage documentation
│   └── static/
│       ├── ai/                 # AI JSON data files
│       └── cross-references.json
│
├── agents/
│   ├── prompts/                # System prompts for AI agents
│   └── contexts/               # AI context files (markdown)
│
├── proposals/                  # Generated change proposals
│
├── src/
│   ├── extract/                # Extraction scripts per layer
│   ├── synthesize/             # Documentation generators
│   ├── propose/                # Proposal generation
│   └── schemas/                # Zod schemas
│
└── scripts/
    └── update-repos.sh         # Update submodules
```

## Commands Reference

### Pipeline

| Command | Description |
|---------|-------------|
| `npm run docs:full` | Extract + synthesize + build site |
| `npm run docs:refresh` | Synthesize + build (skip extraction) |
| `npm run extract:all` | Extract all layers |
| `npm run synthesize:all` | Run all synthesizers |
| `npm run docs:build` | Build Docusaurus site |

### Extraction

| Command | Description |
|---------|-------------|
| `npm run extract:runtime` | Extract runtime pallets |
| `npm run extract:sdk` | Extract SDK packages |
| `npm run extract:indexer` | Extract indexer schema |
| `npm run extract:ui` | Extract UI hooks |
| `npm run extract:chain` | Extract from mainnet RPC |

### Synthesis

| Command | Description |
|---------|-------------|
| `npm run synthesize:crossref` | Build cross-references |
| `npm run synthesize:pallets` | Generate pallet docs |
| `npm run synthesize:sdk` | Generate SDK docs |
| `npm run synthesize:indexer` | Generate indexer docs |
| `npm run synthesize:hooks` | Generate hook docs |
| `npm run synthesize:ai` | Generate AI JSON files |

### Development

| Command | Description |
|---------|-------------|
| `npm run docs:dev` | Start dev server |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | Run ESLint |
| `npm run test:run` | Run tests |
| `npm run submodules:update` | Update repos to latest |

## External Resources

| Resource | URL |
|----------|-----|
| Mainnet RPC | `wss://rpc.hydradx.cloud` |
| Testnet RPC | `wss://paseo-rpc.hydradx.io` |
| Block Explorer | `https://explorer.hydradx.cloud` |
| Pool Data GraphQL | `https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphql` |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT
