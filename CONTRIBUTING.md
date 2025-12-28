# Contributing to Hydration Codex

Thank you for your interest in contributing to the Hydration Codex! This document provides guidelines for contributing to the project.

## Quick Start

```bash
# Clone with submodules
git clone --recursive https://github.com/galacticcouncil/hydration-codex.git
cd hydration-codex

# Install dependencies
npm install

# Initialize submodules (if not cloned with --recursive)
git submodule update --init --recursive

# Run type check to verify setup
npm run typecheck
```

## Project Structure

```
hydration-codex/
├── src/
│   ├── extract/      # Data extraction from source repos
│   ├── synthesize/   # Cross-reference building & doc generation
│   ├── propose/      # Change proposal generation
│   ├── schemas/      # Zod schemas and canonical ID system
│   └── utils/        # Shared utilities
├── repos/            # Git submodules (source repositories)
├── extractions/      # Extracted data (keyed by commit)
├── docs-site/        # Docusaurus documentation site
├── agents/           # AI agent prompts and context files
└── docs/             # Generated documentation
```

## Development Workflow

### 1. Running the Pipeline

```bash
# Full pipeline: extract → synthesize → propose
npm run pipeline

# Or run individual steps:
npm run extract         # Extract from all layers
npm run synthesize      # Build cross-references
npm run propose         # Generate change proposals
```

### 2. Working on Extractors

Extractors live in `src/extract/`. Each layer has its own extractor:
- `runtime.ts` - L1 (Rust/Substrate)
- `sdk.ts` - L2 (TypeScript SDK)
- `indexer.ts` - L3 (Squid GraphQL)
- `ui.ts` - L4 (React UI)

To test a single extractor:
```bash
npm run extract:runtime   # Just L1
npm run extract:sdk       # Just L2
npm run extract:indexer   # Just L3
npm run extract:ui        # Just L4
```

### 3. Working on Synthesizers

Synthesizers live in `src/synthesize/`. Each generates different outputs:
- `crossref.ts` - Cross-reference index
- `pallets.ts` - Pallet MDX pages
- `hooks.ts` - Hook MDX pages
- `flows.ts` - Mermaid diagrams

To run individual synthesizers:
```bash
npm run synthesize:crossref
npm run synthesize:pallets
npm run synthesize:hooks
```

### 4. Working on the Docs Site

```bash
# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Serve production build
npm run docs:serve
```

## Code Standards

### TypeScript

- Use strict TypeScript (`tsconfig.json` has `strict: true`)
- Define types with Zod schemas in `src/schemas/`
- Use the canonical ID system for entity references
- Prefer async/await over callbacks

### Linting & Formatting

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format with Prettier
npm run typecheck   # Type check
```

### Testing

```bash
npm run test        # Watch mode
npm run test:run    # Single run
```

## Commit Guidelines

We follow conventional commits:

```
feat: add new extractor for XYZ
fix: correct cross-reference matching
docs: update README with new commands
refactor: simplify synthesis pipeline
test: add unit tests for canonical IDs
chore: update dependencies
```

### Commit Message Format

```
<type>: <short description>

<optional body explaining what and why>

🤖 Generated with Claude Code
Co-Authored-By: <your-name> <your-email>
```

## Pull Request Process

1. **Fork the repository** and create a feature branch
2. **Make your changes** following the code standards
3. **Run the full CI check**:
   ```bash
   npm run typecheck && npm run lint && npm run test:run
   ```
4. **Update documentation** if needed
5. **Open a PR** with a clear description

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow conventional commits
- [ ] PR description explains the changes

## Working with Submodules

The project uses git submodules for source repositories:

```bash
# Update all submodules to latest
npm run submodules:update
# or
./scripts/update-repos.sh

# Check submodule status
npm run submodules:status
```

## Canonical ID System

When working with cross-references, use the canonical ID system:

```typescript
import { runtime, sdk, ui, indexer } from './schemas/canonical-ids';

// Build IDs
const palletId = runtime.pallet('Omnipool');
const callId = runtime.call('Omnipool', 'add_liquidity');
const hookId = ui.hook('useAddLiquidity');

// Parse IDs
import { parseCanonicalId } from './schemas/canonical-ids';
const parsed = parseCanonicalId('runtime:pallet:Omnipool:call:add_liquidity');
```

See `agents/contexts/CANONICAL_IDS.md` for full documentation.

## Getting Help

- **Issues:** Open a GitHub issue for bugs or feature requests
- **Discussions:** Use GitHub Discussions for questions
- **Discord:** Join the Hydration community Discord

## AI Agent Development

If working on AI agent prompts or context files:

1. Agent prompts are in `agents/prompts/`
2. Context files are in `agents/contexts/`
3. Follow the existing format for new agents
4. Test with Claude Code by loading the prompt

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
