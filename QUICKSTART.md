# Hydration Codex - Quick Start Guide

Get up and running in 5 minutes.

## Prerequisites

- Node.js 20+ (check: `node --version`)
- Git with submodule support

## Setup

```bash
# 1. Clone with submodules
git clone --recursive https://github.com/galacticcouncil/hydration-codex.git
cd hydration-codex

# 2. Install dependencies
npm install

# 3. Verify setup
npm run typecheck
```

## Run the Pipeline

```bash
# Extract data from all source repos
npm run extract

# Sync to extractions directory
npm run extract:sync

# Generate documentation
npm run synthesize:all

# Build the docs site
npm run docs:build

# Preview locally
npm run docs:serve
```

Or use the all-in-one command:
```bash
npm run docs:full
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run extract` | Extract from all layers |
| `npm run synthesize:all` | Generate all documentation |
| `npm run docs:dev` | Start dev server (hot reload) |
| `npm run docs:build` | Build production site |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | Run linter |
| `npm run test:run` | Run tests |

## Common Tasks

### Update Source Repositories

```bash
npm run submodules:update
```

### Extract from Live Chain

```bash
npm run extract:chain           # From mainnet
npm run extract:chain:local     # From local/Chopsticks
```

### Generate Specific Docs

```bash
npm run synthesize:pallets      # Pallet reference pages
npm run synthesize:hooks        # UI hook pages
npm run synthesize:crossref     # Cross-reference index
```

## Project Layout

```
hydration-codex/
├── repos/           # Source repositories (submodules)
├── src/             # TypeScript source
│   ├── extract/     # Data extraction
│   └── synthesize/  # Documentation generation
├── extractions/     # Extracted JSON data
├── docs-site/       # Docusaurus site
└── agents/          # AI agent prompts
```

## Next Steps

- Read `CONTEXT.md` for project context
- Read `IMPLEMENTATION_PLAN.md` for roadmap
- Read `CONTRIBUTING.md` for contribution guidelines
- Check `STATUS.md` for current coverage

## Troubleshooting

### Submodules not initialized
```bash
git submodule update --init --recursive
```

### Missing extractions
```bash
npm run extract
npm run extract:sync
```

### Docs site build fails
```bash
cd docs-site
npm install
npm run build
```

## Getting Help

- Open an issue: https://github.com/galacticcouncil/hydration-codex/issues
- Read the full README: `README.md`
