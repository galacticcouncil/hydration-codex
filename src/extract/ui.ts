import { join } from 'path';
import { createLogger } from '../utils/logger.js';
import { readFile, writeJSON, writeFile, findFiles, grepFiles } from '../utils/files.js';
import { getGitInfo } from '../utils/git.js';
import type { UIExtraction, Component, Hook } from '../schemas/extraction.js';

const log = createLogger('L4:ui');

interface ExtractOptions {
  repoPath: string;
  outputPath: string;
}

function extractComponents(repoPath: string): Component[] {
  const components: Component[] = [];

  // Find React components - check both src/ and apps/*/src/ for monorepos
  const srcFiles = findFiles('src/**/*.tsx', repoPath);
  const appsFiles = findFiles('apps/*/src/**/*.tsx', repoPath);
  const packagesFiles = findFiles('packages/*/src/**/*.tsx', repoPath);
  const files = [...srcFiles, ...appsFiles, ...packagesFiles];

  for (const file of files) {
    const content = readFile(join(repoPath, file));
    if (!content) continue;

    // Match: export function ComponentName or export const ComponentName
    const matches = content.matchAll(/export\s+(?:default\s+)?(?:function|const)\s+([A-Z]\w+)/g);

    for (const match of matches) {
      components.push({
        name: match[1],
        file,
      });
    }
  }

  return components;
}

function extractHooks(repoPath: string): Hook[] {
  const hooks: Hook[] = [];

  // Search both src/ and apps/*/src/ for monorepos
  const srcMatches = grepFiles(repoPath, 'src/**/*.ts', /export\s+(?:function|const)\s+(use\w+)/);
  const appsMatches = grepFiles(repoPath, 'apps/*/src/**/*.ts', /export\s+(?:function|const)\s+(use\w+)/);
  const matches = [...srcMatches, ...appsMatches];

  for (const match of matches) {
    const hookMatch = match.content.match(/export\s+(?:function|const)\s+(use\w+)/);
    if (hookMatch) {
      const content = readFile(join(repoPath, match.file)) || '';

      hooks.push({
        name: hookMatch[1],
        file: match.file,
        line: match.line,
        usesSDK: content.includes('api.tx.') || content.includes('api.query.'),
        usesIndexer: content.includes('useQuery') || content.includes('gql`'),
      });
    }
  }

  return hooks;
}

function extractSDKUsage(repoPath: string): Array<{ call: string; file: string; line: number }> {
  const results: Array<{ call: string; file: string; line: number }> = [];

  // Pattern 1: api.tx.Pallet.method or api.query.Pallet.method (legacy)
  const legacyMatches = [
    ...grepFiles(repoPath, 'src/**/*.{ts,tsx}', /api\.(tx|query)\.(\w+)\.(\w+)/),
    ...grepFiles(repoPath, 'apps/*/src/**/*.{ts,tsx}', /api\.(tx|query)\.(\w+)\.(\w+)/),
  ];
  for (const m of legacyMatches) {
    const match = m.content.match(/api\.(tx|query)\.(\w+)\.(\w+)/);
    if (match) {
      results.push({ call: `${match[1]}.${match[2]}.${match[3]}`, file: m.file, line: m.line });
    }
  }

  // Pattern 2: papi.query.Pallet.Method (polkadot-api direct queries)
  const papiMatches = [
    ...grepFiles(repoPath, 'src/**/*.{ts,tsx}', /papi\.query\.(\w+)\.(\w+)/),
    ...grepFiles(repoPath, 'apps/*/src/**/*.{ts,tsx}', /papi\.query\.(\w+)\.(\w+)/),
  ];
  for (const m of papiMatches) {
    const match = m.content.match(/papi\.query\.(\w+)\.(\w+)/);
    if (match) {
      results.push({ call: `papi.query.${match[1]}.${match[2]}`, file: m.file, line: m.line });
    }
  }

  // Pattern 3: sdk.api.module.method (SDK wrapper calls)
  const sdkApiMatches = [
    ...grepFiles(repoPath, 'src/**/*.{ts,tsx}', /sdk\.api\.(\w+)\.(\w+)/),
    ...grepFiles(repoPath, 'apps/*/src/**/*.{ts,tsx}', /sdk\.api\.(\w+)\.(\w+)/),
  ];
  for (const m of sdkApiMatches) {
    const match = m.content.match(/sdk\.api\.(\w+)\.(\w+)/);
    if (match) {
      results.push({ call: `sdk.api.${match[1]}.${match[2]}`, file: m.file, line: m.line });
    }
  }

  // Pattern 4: sdk.client.module.method
  const sdkClientMatches = [
    ...grepFiles(repoPath, 'src/**/*.{ts,tsx}', /sdk\.client\.(\w+)\.(\w+)/),
    ...grepFiles(repoPath, 'apps/*/src/**/*.{ts,tsx}', /sdk\.client\.(\w+)\.(\w+)/),
  ];
  for (const m of sdkClientMatches) {
    const match = m.content.match(/sdk\.client\.(\w+)\.(\w+)/);
    if (match) {
      results.push({ call: `sdk.client.${match[1]}.${match[2]}`, file: m.file, line: m.line });
    }
  }

  return results;
}

function extractIndexerUsage(repoPath: string): Array<{ query: string; file: string; line: number }> {
  const results: Array<{ query: string; file: string; line: number }> = [];

  // Pattern 1: indexerSdk.MethodName() - IndexerSdk method calls
  const indexerSdkMatches = [
    ...grepFiles(repoPath, 'src/**/*.{ts,tsx}', /indexerSdk\.(\w+)/),
    ...grepFiles(repoPath, 'apps/*/src/**/*.{ts,tsx}', /indexerSdk\.(\w+)/),
  ];
  for (const m of indexerSdkMatches) {
    const match = m.content.match(/indexerSdk\.(\w+)/);
    if (match) {
      results.push({ query: `indexerSdk.${match[1]}`, file: m.file, line: m.line });
    }
  }

  // Pattern 2: squidSdk.methodName() - SquidSdk method calls
  const squidSdkMatches = [
    ...grepFiles(repoPath, 'src/**/*.{ts,tsx}', /squidSdk\.(\w+)/),
    ...grepFiles(repoPath, 'apps/*/src/**/*.{ts,tsx}', /squidSdk\.(\w+)/),
  ];
  for (const m of squidSdkMatches) {
    const match = m.content.match(/squidSdk\.(\w+)/);
    if (match) {
      results.push({ query: `squidSdk.${match[1]}`, file: m.file, line: m.line });
    }
  }

  // Pattern 3: imports from @galacticcouncil/indexer (query functions)
  const indexerImportMatches = [
    ...grepFiles(repoPath, 'src/**/*.{ts,tsx}', /from\s+["']@galacticcouncil\/indexer/),
    ...grepFiles(repoPath, 'apps/*/src/**/*.{ts,tsx}', /from\s+["']@galacticcouncil\/indexer/),
  ];
  for (const m of indexerImportMatches) {
    // Extract imported names that end with Query
    const importMatch = m.content.match(/import\s*\{([^}]+)\}/);
    if (importMatch) {
      const imports = importMatch[1].split(',').map(s => s.trim());
      for (const imp of imports) {
        if (imp.includes('Query') || imp.includes('query')) {
          results.push({ query: `indexer.${imp}`, file: m.file, line: m.line });
        }
      }
    }
  }

  // Pattern 4: useQuery with specific query keys related to indexer
  const useQueryMatches = [
    ...grepFiles(repoPath, 'src/**/*.{ts,tsx}', /useQuery|gql`|SQUID_URL/),
    ...grepFiles(repoPath, 'apps/*/src/**/*.{ts,tsx}', /useQuery|gql`|SQUID_URL/),
  ];
  for (const m of useQueryMatches) {
    // Only add if not already captured by other patterns
    if (!results.find(r => r.file === m.file && r.line === m.line)) {
      results.push({ query: m.match, file: m.file, line: m.line });
    }
  }

  return results;
}

function generateUIContextDoc(result: UIExtraction): string {
  const { meta, components, hooks, sdkUsage, indexerUsage, statistics } = result;

  // Group components by feature area (based on directory patterns)
  const componentsByFeature = new Map<string, Component[]>();
  for (const c of components) {
    let feature = 'Other';
    const fileLower = c.file.toLowerCase();
    if (fileLower.includes('/trade/') || fileLower.includes('/swap/')) {
      feature = 'Trading';
    } else if (fileLower.includes('/liquidity/') || fileLower.includes('/pool')) {
      feature = 'Liquidity';
    } else if (fileLower.includes('/staking/')) {
      feature = 'Staking';
    } else if (fileLower.includes('/borrow/') || fileLower.includes('/aave/')) {
      feature = 'Borrowing';
    } else if (fileLower.includes('/layout/') || fileLower.includes('/header/') || fileLower.includes('/nav')) {
      feature = 'Layout';
    } else if (fileLower.includes('/wallet/') || fileLower.includes('/account/')) {
      feature = 'Wallet';
    } else if (fileLower.includes('/transaction/')) {
      feature = 'Transactions';
    } else if (fileLower.includes('/components/')) {
      feature = 'Shared Components';
    } else if (fileLower.includes('/xcm/') || fileLower.includes('/bridge/')) {
      feature = 'Cross-Chain';
    } else if (fileLower.includes('/referral')) {
      feature = 'Referrals';
    }
    if (!componentsByFeature.has(feature)) componentsByFeature.set(feature, []);
    componentsByFeature.get(feature)!.push(c);
  }

  // Group hooks by SDK/Indexer usage
  const sdkHooks = hooks.filter(h => h.usesSDK);
  const indexerHooks = hooks.filter(h => h.usesIndexer);

  // Categorize SDK calls by type
  const txCalls = sdkUsage.filter(s => s.call.includes('tx.'));
  const queryCalls = sdkUsage.filter(s => s.call.includes('query.'));

  return `# L4: UI Context

> **Auto-generated** - Do not edit manually.
> Extracted: ${meta.extractedAt}
> Commit: \`${meta.source.commit.slice(0, 7)}\` (${meta.source.branch})

## Summary

| Metric | Count |
|--------|-------|
| Components | ${statistics.componentsCount} |
| Hooks | ${statistics.hooksCount} |
| SDK Calls | ${statistics.sdkCalls} |
| Indexer Queries | ${statistics.indexerQueries} |

## Components by Feature

${[...componentsByFeature.entries()].sort((a, b) => b[1].length - a[1].length).map(([feature, comps]) => `### ${feature} (${comps.length})

<details>
<summary>Show all ${comps.length} components</summary>

${comps.map(c => `- ${c.name} — \`${c.file}\``).join('\n')}

</details>
`).join('\n')}

## Hooks

### SDK-connected (${sdkHooks.length})

${sdkHooks.map(h => `- \`${h.name}\` — ${h.file.split('/').pop()}`).join('\n')}

### Indexer-connected (${indexerHooks.length})

${indexerHooks.map(h => `- \`${h.name}\` — ${h.file.split('/').pop()}`).join('\n')}

## SDK Usage

### Transaction Calls (${txCalls.length})

${[...new Set(txCalls.map(s => s.call))].map(c => `- \`${c}\``).join('\n')}

### Query Calls (${queryCalls.length})

${[...new Set(queryCalls.map(s => s.call))].map(c => `- \`${c}\``).join('\n')}

## Indexer Usage (${[...new Set(indexerUsage.map(i => i.file))].length} files)

${[...new Set(indexerUsage.map(i => i.file))].map(f => `- \`${f}\``).join('\n')}
`;
}

export async function extractUI(options: ExtractOptions): Promise<UIExtraction> {
  const { repoPath, outputPath } = options;

  log.section('Hydration UI (L4) Extraction');
  log.info(`Source: ${repoPath}`);
  log.info(`Output: ${outputPath}`);

  const gitInfo = getGitInfo(repoPath);
  log.step(`Commit: ${gitInfo.commit.slice(0, 7)} (${gitInfo.branch})`);

  // Extract components
  log.section('Extracting Components');
  const components = extractComponents(repoPath);
  log.success(`Found ${components.length} components`);

  // Extract hooks
  log.section('Extracting Hooks');
  const hooks = extractHooks(repoPath);
  log.success(`Found ${hooks.length} hooks`);

  // Extract SDK usage
  log.section('Extracting SDK Usage');
  const sdkUsage = extractSDKUsage(repoPath);
  log.success(`Found ${sdkUsage.length} SDK calls`);

  // Extract indexer usage
  log.section('Extracting Indexer Usage');
  const indexerUsage = extractIndexerUsage(repoPath);
  log.success(`Found ${indexerUsage.length} indexer queries`);

  const result: UIExtraction = {
    meta: {
      layer: 'L4',
      name: 'ui',
      extractedAt: new Date().toISOString(),
      source: gitInfo,
    },
    components,
    hooks,
    sdkUsage,
    indexerUsage,
    statistics: {
      componentsCount: components.length,
      hooksCount: hooks.length,
      sdkCalls: sdkUsage.length,
      indexerQueries: indexerUsage.length,
    },
  };

  writeJSON(join(outputPath, 'extraction.json'), result);
  log.success(`Output written to ${outputPath}/extraction.json`);

  // Generate L4 context doc
  const contextDoc = generateUIContextDoc(result);
  const contextPath = join(process.cwd(), 'agents/contexts/L4-ui.md');
  writeFile(contextPath, contextDoc);
  log.success('Updated agents/contexts/L4-ui.md');

  log.section('Extraction Complete');
  console.log(`
  Components:      ${result.statistics.componentsCount}
  Hooks:           ${result.statistics.hooksCount}
  SDK Calls:       ${result.statistics.sdkCalls}
  Indexer Queries: ${result.statistics.indexerQueries}
  `);

  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const repoPath = process.env.REPO_PATH || './repos/hydration-ui';
  const outputPath = process.env.OUTPUT_PATH || './extractions/ui';

  extractUI({ repoPath, outputPath }).catch((err) => {
    console.error('Extraction failed:', err);
    process.exit(1);
  });
}
