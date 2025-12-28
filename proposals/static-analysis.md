# Static Analysis for Cross-Layer Tracing

> Proposal for proper code analysis to trace relationships between UI, SDK, and Runtime layers.

## Problem

Current cross-reference building has gaps:

1. **UI hooks in `states/*.ts`** use SDK calls from `api/*.ts` - different files, so file-based mapping misses them
2. **SDK methods** internally call `api.query.*` / `api.tx.*` but we don't trace inside SDK source
3. **Indirect calls** through Jotai atoms, React Query, or helper functions aren't traced

Current approach only catches:
- Direct `tx.*` / `query.*` calls in the same file as a hook
- High-level `sdk.api.*` patterns (hardcoded mapping)

## Solution: AST-Based Static Analysis

### Phase 1: UI Import Chain Tracing

Parse TypeScript AST to follow imports:

```
useAccountBalance (states/account.ts)
  └─ imports getAccountBalances (api/balances.ts)
       └─ calls api.query.Balances.Locks
       └─ calls api.query.Tokens.Accounts
```

**Implementation:**
```typescript
// Use TypeScript Compiler API
import * as ts from 'typescript';

interface CallTrace {
  hook: string;
  file: string;
  imports: ImportTrace[];
  directCalls: RuntimeCall[];
}

interface ImportTrace {
  from: string;  // imported function/module
  file: string;  // source file
  calls: RuntimeCall[];
}

interface RuntimeCall {
  type: 'query' | 'tx';
  pallet: string;
  item: string;
  line: number;
}
```

### Phase 2: SDK Internal Analysis

Parse SDK source to build method → runtime mapping:

```
sdk.api.router.getBestSell()
  └─ calls api.query.Router.routes
  └─ calls api.query.Omnipool.assets
  └─ calls api.query.XYK.poolAssets
```

**Output:** `sdk-runtime-mapping.json`
```json
{
  "router.getBestSell": {
    "queries": ["Router.routes", "Omnipool.assets", "XYK.poolAssets"],
    "calls": []
  },
  "omnipool.addLiquidity": {
    "queries": ["Omnipool.assets"],
    "calls": ["Omnipool.add_liquidity"]
  }
}
```

### Phase 3: Chain the Links

Combine UI → SDK → Runtime:

```
ui:hook:useSwap
  └─ calls sdk:method:router.getBestSell
       └─ queries runtime:pallet:Router:storage:routes
       └─ queries runtime:pallet:Omnipool:storage:assets
```

## Implementation Plan

### 1. New Extractor: `src/extract/static-analysis.ts`

```typescript
interface StaticAnalysisResult {
  ui: {
    hooks: HookAnalysis[];
  };
  sdk: {
    methods: MethodAnalysis[];
  };
}

interface HookAnalysis {
  name: string;
  file: string;
  imports: string[];           // Functions imported
  sdkCalls: string[];          // SDK methods called
  runtimeCalls: RuntimeCall[]; // Direct runtime calls
}

interface MethodAnalysis {
  name: string;
  file: string;
  runtimeCalls: RuntimeCall[];
}
```

### 2. Tools Required

- **TypeScript Compiler API** (`typescript` package)
  - Parse AST
  - Resolve imports
  - Track call expressions

- **ts-morph** (optional, simpler API)
  - Higher-level AST manipulation
  - Easier import resolution

### 3. Analysis Steps

```
1. Parse all UI .ts/.tsx files
2. Find hook definitions (functions starting with 'use')
3. For each hook:
   a. Find all import statements
   b. Resolve imported functions to their source files
   c. Recursively find all api.query.* / api.tx.* calls
   d. Find all sdk.* calls
4. Parse SDK source files
5. For each exported method:
   a. Find all api.query.* / api.tx.* calls
6. Build complete call graph
7. Output to extraction JSON
```

### 4. Integration with Crossref

Update `crossref.ts` to use static analysis output:

```typescript
// Load static analysis results
const analysis = loadStaticAnalysis(extractionsPath);

// Build edges from traced calls
for (const hook of analysis.ui.hooks) {
  const hookId = ui.hook(hook.name);

  // Direct runtime calls
  for (const call of hook.runtimeCalls) {
    const runtimeId = call.type === 'query'
      ? runtime.storage(call.pallet, call.item)
      : runtime.call(call.pallet, call.item);
    addEdge(edges, entries, hookId, runtimeId, call.type === 'query' ? 'queries' : 'calls');
  }

  // SDK method calls → runtime (via SDK analysis)
  for (const sdkCall of hook.sdkCalls) {
    const method = analysis.sdk.methods.find(m => m.name === sdkCall);
    if (method) {
      for (const call of method.runtimeCalls) {
        // ... add edges
      }
    }
  }
}
```

## Benefits

1. **Accurate**: Traces actual code, not guesses
2. **Complete**: Catches indirect calls through imports
3. **Maintainable**: No manual mappings to update
4. **Debuggable**: Can output call graph for inspection

## Effort Estimate

- Phase 1 (UI import tracing): Medium complexity
- Phase 2 (SDK analysis): Medium complexity
- Phase 3 (Integration): Low complexity

## Alternatives Considered

1. **Runtime instrumentation**: Too invasive, requires running code
2. **Name-based heuristics**: Brittle, already tried and rejected
3. **Manual annotations**: High maintenance burden

## Implementation Status

### ✅ Completed

1. **Import chain tracing** - Traces function imports to find runtime calls
2. **Class method analysis** - Analyzes SDK class methods (not just functions)
3. **Store detection** - Finds state containers (Zustand, etc.) and their setters/selectors
4. **Reactive data flow** - Links consumer → store → populator → runtime calls via edges
5. **Crossref integration** - Static analysis feeds into crossref pipeline with `reads`/`writes` edges
6. **Summary generation** - Markdown reports of analysis results

### Results

- 270 hooks traced
- 204 runtime calls found (197 direct + 7 via store chains)
- 7 stores detected (Zustand)
- Store flow: `useStakingAPR → useIncreaseStake → useRewardsCurveData`

### Architecture

The reactive data flow is modeled in the canonical ID graph:

```
ui:store:useAccountData           ← Store entity
    ↑
    │ writes
ui:hook:useAccountBalanceSubscription → runtime:storage:Tokens:Accounts
    │
    │ reads
    ↓
ui:hook:useAccountBalance         ← Gets runtime calls via store propagation
```

### 🔄 Future Enhancements

1. **Variable alias tracking** - Track `const { balance } = sdk.client` to trace `balance.method()` calls
2. **More state patterns** - Jotai atoms, Redux slices, React Context
3. **SDK subscription methods** - Add patterns for `subscribeSystemBalance`, `subscribeTokensBalance`
4. **React Query integration** - Trace useQuery hooks to their query functions
5. **Computed/derived state** - Track selectors that derive from multiple stores
