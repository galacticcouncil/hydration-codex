# Operational Knowledge

> Critical operational patterns for AI agents. This file persists across sessions.

## Command Execution

**Use npm scripts directly:**

```bash
npm run synthesize:all      # Run all synthesizers
npm run synthesize:pallets  # Generate pallet docs
npm run docs:build          # Build Docusaurus site
```

## Available Scripts

### Extraction
```bash
npm run extract:chain       # Extract chain metadata from live node
npm run extract:metadata    # Extract detailed pallet metadata
npm run extract:ui          # Extract UI hooks and usage
npm run extract:sdk         # Extract SDK methods
npm run extract:indexer     # Extract indexer entities
```

### Synthesis
```bash
npm run synthesize:all      # Run all synthesizers
npm run synthesize:crossref # Generate cross-reference index
npm run synthesize:pallets  # Generate pallet documentation
npm run synthesize:indexer  # Generate indexer documentation
npm run synthesize:sdk      # Generate SDK documentation
```

### Documentation
```bash
npm run docs:build          # Build Docusaurus site
npm run docs:serve          # Serve docs locally
```

### Development
```bash
npm run typecheck           # Run TypeScript type checker
npm run lint                # Run linter
npm run lint:fix            # Fix lint issues
npm run test:run            # Run tests
```

## Data Paths

| Purpose | Path |
|---------|------|
| Raw extractions | `./raw/` |
| Docs output | `./docs-site/docs/` |
| Static assets | `./docs-site/static/` |
| Cross-ref index | `./docs-site/static/cross-references.json` |

## Cross-Reference System

The cross-reference system provides bi-directional mappings:

- **Runtime (1152 items)**: pallets, storage, extrinsics, events
- **Indexer (123 entities)**: GraphQL entities
- **SDK (11 packages)**: SDK methods
- **UI (223 hooks)**: React hooks

### Relationships
- UI hooks → Runtime (storage queries, extrinsics)
- UI hooks → Indexer (GraphQL queries)
- Indexer → Runtime (event tracking)

### Files Generated
- `cross-references.json` - Full index for programmatic use
- `cross-references-summary.md` - AI-friendly summary
- `agents/contexts/CROSS_REFERENCES.md` - Context for agents

## Hook Categories (Derived from File Paths)

Categories are derived dynamically from file paths, not hardcoded:
- liquidity, trade, states, borrow, wallet, staking, etc.

## Project Conventions

1. **No hardcoding** - Derive mappings from source data
2. **Bi-directional links** - Every reference should be navigable both ways
3. **Layer naming** - Runtime, SDK, Indexer, UI (not L1-L4 in user-facing docs)
4. **npm scripts** - Use `npm run <script>` for all tasks
