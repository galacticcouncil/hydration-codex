# Hydration Codex - Quick Context

> **TL;DR**: Auto-generating Docusaurus docs from Hydration Protocol source code.

## What

```
Source Code (4 layers) → Extraction → Synthesis → Docusaurus Site
     L1: Runtime (48 pallets)
     L2: SDK (TypeScript)
     L3: Indexer (Squid)
     L4: UI (226 React hooks)
```

## Current State

**Done:**
- Extraction pipeline for all 4 layers
- Per-hook Mermaid diagrams (99 generated)
- Architecture design document
- This implementation plan

**Next:**
- Phase 1: Docusaurus scaffold
- Phase 2: Hook page MDX generator
- Phase 3-7: Pallet, SDK, Feature, Indexer, AI pages

## Key Files

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_PLAN.md` | Full roadmap, templates, decisions |
| `docs/ARCHITECTURE.md` | Site structure, cross-refs, AI design |
| `src/extract/*.ts` | Data extraction from source repos |
| `src/synthesize/flows.ts` | Diagram generation |
| `raw/{layer}/extraction.json` | Extracted data |
| `docs/flows/hooks/` | Generated Mermaid diagrams |

## Commands

```bash
npm run extract              # Extract from source
npm run synthesize:flows     # Generate diagrams
npm run synthesize:docs      # Generate MDX (TODO)
```

## Continue From

Read `IMPLEMENTATION_PLAN.md` → Start Phase 1 (Docusaurus scaffold)
