/**
 * Hooks Pages Generator - Generate MDX pages for UI hooks
 *
 * Reads UI extraction and generates documentation pages for React hooks.
 * Cross-references with runtime pallets and indexer entities using canonical IDs.
 */

import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync, readFileSync } from 'fs';
import { createLogger } from '../utils/logger.js';
import { readJSON } from '../utils/files.js';
import { normalizePalletName } from '../utils/pallets.js';
import type { CanonicalIndex, CanonicalEdge } from '../schemas/canonical-ids.js';
import { parseCanonicalId, ui } from '../schemas/canonical-ids.js';

const log = createLogger('hooks');

interface UIExtraction {
  meta: {
    layer: string;
    name: string;
    extractedAt: string;
    source: {
      commit: string;
      branch: string;
      repo: string;
    };
  };
  hooks: UIHook[];
  sdkUsage: { file: string; call: string; line: number }[];
  indexerUsage: { file: string; query: string; line: number }[];
}

interface UIHook {
  name: string;
  file: string;
  line: number;
  usesSDK: boolean;
  usesIndexer: boolean;
}

interface HooksOptions {
  extractionsPath: string;
  outputPath: string;
}

export async function synthesizeHooks(options: HooksOptions): Promise<void> {
  const { extractionsPath, outputPath } = options;

  log.section('Hooks Documentation Generation');

  // Load UI extraction
  const extraction = loadLatestExtraction(extractionsPath);
  if (!extraction) {
    throw new Error('Missing UI extraction. Run npm run extract:ui first.');
  }

  const hooks = extraction.hooks;
  log.info(`Loaded ${hooks.length} hooks`);
  log.info(`Source: ${extraction.meta.source.repo}@${extraction.meta.source.branch}`);

  // Load cross-reference index (v2 with canonical IDs)
  const crossRefPath = join(outputPath, '../static/cross-references.json');
  let crossRef: CanonicalIndex | null = null;
  if (existsSync(crossRefPath)) {
    crossRef = readJSON<CanonicalIndex>(crossRefPath);
    const totalEdges = crossRef?.edges?.length ?? 0;
    log.info(`Loaded cross-reference index: ${totalEdges} edges`);
  } else {
    log.warn('Cross-reference index not found. Run npm run synthesize:crossref first.');
  }

  // Build hook → related maps from edges
  const hookToRuntime = new Map<string, string[]>();
  const hookToIndexer = new Map<string, string[]>();

  if (crossRef?.edges) {
    for (const edge of crossRef.edges) {
      // Skip containment edges
      if (edge.type === 'contains') continue;

      try {
        const fromParsed = parseCanonicalId(edge.from);
        const toParsed = parseCanonicalId(edge.to);

        // UI hook → Runtime
        if (fromParsed.layer === 'ui' && fromParsed.segments[0]?.type === 'hook' &&
            toParsed.layer === 'runtime') {
          const hookName = fromParsed.segments[0].name;
          const runtimeRef = formatRuntimeRef(toParsed);

          if (!hookToRuntime.has(hookName)) hookToRuntime.set(hookName, []);
          const refs = hookToRuntime.get(hookName)!;
          if (!refs.includes(runtimeRef)) refs.push(runtimeRef);
        }

        // UI hook → Indexer
        if (fromParsed.layer === 'ui' && fromParsed.segments[0]?.type === 'hook' &&
            toParsed.layer === 'indexer' && toParsed.segments[0]?.type === 'entity') {
          const hookName = fromParsed.segments[0].name;
          const entityName = toParsed.segments[0].name;

          if (!hookToIndexer.has(hookName)) hookToIndexer.set(hookName, []);
          const refs = hookToIndexer.get(hookName)!;
          if (!refs.includes(entityName)) refs.push(entityName);
        }
      } catch {
        // Skip invalid edges
        continue;
      }
    }
  }

  log.info(`Loaded ${hookToRuntime.size} hook→Runtime mappings, ${hookToIndexer.size} hook→Indexer mappings`);

  // Group hooks by category (derived from file path)
  const hooksByCategory = new Map<string, UIHook[]>();
  for (const hook of hooks) {
    const category = deriveCategoryFromPath(hook.file);
    if (!hooksByCategory.has(category)) {
      hooksByCategory.set(category, []);
    }
    hooksByCategory.get(category)!.push(hook);
  }

  log.info(`Found ${hooksByCategory.size} categories`);

  // Create output directories and generate pages
  const hooksOutputPath = join(outputPath, 'reference/hooks');
  mkdirSync(hooksOutputPath, { recursive: true });

  log.section('Generating Hook Pages');

  let generatedCount = 0;

  for (const [category, categoryHooks] of hooksByCategory) {
    // Create category directory
    const categoryPath = join(hooksOutputPath, category);
    mkdirSync(categoryPath, { recursive: true });

    // Generate page for each hook
    for (const hook of categoryHooks) {
      const runtime = hookToRuntime.get(hook.name) || [];
      const indexer = hookToIndexer.get(hook.name) || [];
      const mdxContent = generateHookMdx(hook, category, extraction.meta, runtime, indexer);
      const filePath = join(categoryPath, `${hook.name}.mdx`);
      writeFileSync(filePath, mdxContent);
      generatedCount++;
    }

    // Category index is auto-generated by Docusaurus sidebar (generated-index)
  }

  log.info(`Generated ${generatedCount} hook pages`);

  // Main index is auto-generated by Docusaurus sidebar (generated-index)

  // Generate hook location index (for cross-referencing from pallets/indexer)
  const hookIndex: Record<string, { category: string; file: string }> = {};
  for (const [category, categoryHooks] of hooksByCategory) {
    for (const hook of categoryHooks) {
      hookIndex[hook.name] = { category, file: hook.file };
    }
  }
  const indexPath = join(outputPath, '../static/hook-index.json');
  writeFileSync(indexPath, JSON.stringify(hookIndex, null, 2));
  log.info(`Generated hook index: ${Object.keys(hookIndex).length} hooks → ${indexPath}`);

  log.success(`Generated ${generatedCount} hook pages in ${hooksByCategory.size} categories`);

  log.section('Generation Complete');
  console.log(`\n  Output: ${hooksOutputPath}/`);
  console.log(`  Pages: ${generatedCount}\n`);
}

/**
 * Format a runtime reference for display.
 * Converts canonical ID segments to display format like "Omnipool.add_liquidity"
 */
function formatRuntimeRef(parsed: ReturnType<typeof parseCanonicalId>): string {
  const segments = parsed.segments;
  if (segments.length === 1) {
    // Just pallet: "Omnipool"
    return segments[0].name;
  } else if (segments.length === 2) {
    // Pallet + item: "Omnipool.add_liquidity" or "Omnipool"
    const [pallet, item] = segments;
    if (item.type === 'call' || item.type === 'storage' || item.type === 'event') {
      return `${pallet.name}.${item.name}`;
    }
    return pallet.name;
  }
  // Fallback: just pallet name
  return segments[0].name;
}

function loadLatestExtraction(baseDir: string): UIExtraction | null {
  const layerDir = join(baseDir, 'ui');
  if (!existsSync(layerDir)) return null;

  // Try extraction.json first
  const extractionPath = join(layerDir, 'extraction.json');
  if (existsSync(extractionPath)) {
    const content = readFileSync(extractionPath, 'utf-8');
    return JSON.parse(content);
  }

  // Otherwise find newest JSON file
  const files = readdirSync(layerDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) return null;

  const sortedFiles = files.sort((a, b) => {
    const statA = statSync(join(layerDir, a));
    const statB = statSync(join(layerDir, b));
    return statB.mtime.getTime() - statA.mtime.getTime();
  });

  const content = readFileSync(join(layerDir, sortedFiles[0]), 'utf-8');
  return JSON.parse(content);
}

// Valid categories - hooks outside these go to 'utils'
const VALID_CATEGORIES = new Set([
  'liquidity', 'trade', 'swap', 'borrow', 'wallet', 'staking',
  'transactions', 'account', 'chain', 'omnipool', 'farms',
  'pools', 'dca', 'otc', 'assets', 'xyk', 'stableswap',
]);

// Map file patterns to categories
const CATEGORY_MAPPINGS: Record<string, string> = {
  'spotprice': 'trade',
  'evm': 'transactions',
  'rpc': 'chain',
  'provider': 'chain',
  'payments': 'transactions',
  'states': 'utils',
  'external': 'utils',
  'layout': 'utils',
  'data': 'utils',
  'validators': 'utils',
};

// Derive category from file path
function deriveCategoryFromPath(filePath: string): string {
  const parts = filePath.split('/');

  // First check directory names
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (['src', 'apps', 'main', 'api', 'hooks', 'components', 'modules', 'utils', 'lib'].includes(lower)) {
      continue;
    }
    if (part.includes('.')) continue;

    if (VALID_CATEGORIES.has(lower)) {
      return lower;
    }
    if (CATEGORY_MAPPINGS[lower]) {
      return CATEGORY_MAPPINGS[lower];
    }
  }

  // Then check filename (without extension)
  const filename = parts[parts.length - 1].replace(/\.(ts|tsx|js|jsx)$/, '').toLowerCase();
  if (VALID_CATEGORIES.has(filename)) {
    return filename;
  }
  if (CATEGORY_MAPPINGS[filename]) {
    return CATEGORY_MAPPINGS[filename];
  }

  return 'utils';
}

function generateHookMdx(
  hook: UIHook,
  category: string,
  meta: UIExtraction['meta'],
  runtime: string[],
  indexer: string[]
): string {
  const githubLink = `https://github.com/${meta.source.repo}/blob/${meta.source.commit}/${hook.file}#L${hook.line}`;

  const lines: string[] = [
    '---',
    `title: ${hook.name}`,
    `description: UI hook documentation`,
    `sidebar_label: ${hook.name}`,
    '---',
    '',
    `# ${hook.name}`,
    '',
    '<!-- AI_DESCRIPTION_START -->',
    '<!-- AI_DESCRIPTION_END -->',
    '',
    `**Source:** [${hook.file}:${hook.line}](${githubLink})`,
    '',
  ];

  // Usage section
  lines.push('## Usage');
  lines.push('');
  lines.push('```typescript');
  lines.push(`import { ${hook.name} } from '@galacticcouncil/hydration-ui';`);
  lines.push('');
  lines.push(`const result = ${hook.name}();`);
  lines.push('```');
  lines.push('');

  // References section (cross-references)
  if (runtime.length > 0 || indexer.length > 0) {
    lines.push('## References');
    lines.push('');

    // Runtime pallets/extrinsics/storage
    if (runtime.length > 0) {
      lines.push(`### Runtime (${runtime.length})`);
      lines.push('');
      for (const item of runtime) {
        const pallet = normalizePalletName(item.split('.')[0]);
        lines.push(`- [${item}](/reference/pallets/${pallet})`);
      }
      lines.push('');
    }

    // Indexer entities
    if (indexer.length > 0) {
      lines.push(`### Indexer (${indexer.length})`);
      lines.push('');
      for (const entity of indexer) {
        lines.push(`- [${entity}](/reference/indexer/${entity})`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

function generateCategoryIndex(
  category: string,
  hooks: UIHook[],
  hookToRuntime: Map<string, string[]>,
  hookToIndexer: Map<string, string[]>
): string {
  const title = category.charAt(0).toUpperCase() + category.slice(1);

  const lines: string[] = [
    '---',
    `title: ${title} Hooks`,
    `description: UI hooks for ${category} functionality`,
    'sidebar_class_name: hidden',
    '---',
    '',
    `# ${title} Hooks`,
    '',
    `${hooks.length} hooks for ${category} functionality.`,
    '',
    '| Hook | SDK | Indexer | Runtime |',
    '|------|-----|---------|---------|',
  ];

  // Sort hooks alphabetically
  const sortedHooks = [...hooks].sort((a, b) => a.name.localeCompare(b.name));

  for (const hook of sortedHooks) {
    const runtimeCount = hookToRuntime.get(hook.name)?.length || 0;
    const indexerCount = hookToIndexer.get(hook.name)?.length || 0;
    const sdk = hook.usesSDK ? 'Yes' : '-';
    const indexer = indexerCount > 0 ? `${indexerCount}` : '-';
    const runtime = runtimeCount > 0 ? `${runtimeCount}` : '-';
    lines.push(`| [${hook.name}](/reference/hooks/${category}/${hook.name}) | ${sdk} | ${indexer} | ${runtime} |`);
  }

  lines.push('');

  return lines.join('\n');
}

function generateHooksIndex(
  extraction: UIExtraction,
  hooksByCategory: Map<string, UIHook[]>,
  hookToRuntime: Map<string, string[]>
): string {
  const totalHooks = extraction.hooks.length;

  const lines: string[] = [
    '---',
    'title: UI Reference',
    'description: Complete reference for UI hooks',
    'sidebar_class_name: hidden',
    '---',
    '',
    '# UI Reference',
    '',
    `Documentation for ${totalHooks} React hooks across ${hooksByCategory.size} categories.`,
    '',
    `**Source:** [${extraction.meta.source.repo}](https://github.com/${extraction.meta.source.repo})`,
    '',
    '## Categories',
    '',
    '| Category | Hooks | With Runtime |',
    '|----------|-------|--------------|',
  ];

  // Sort categories by hook count
  const sortedCategories = [...hooksByCategory.entries()]
    .sort((a, b) => b[1].length - a[1].length);

  for (const [category, hooks] of sortedCategories) {
    const title = category.charAt(0).toUpperCase() + category.slice(1);
    const withRuntime = hooks.filter(h => hookToRuntime.has(h.name)).length;
    lines.push(`| [${title}](/reference/hooks/${category}) | ${hooks.length} | ${withRuntime} |`);
  }

  lines.push('');

  return lines.join('\n');
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const extractionsPath = process.env.EXTRACTIONS_PATH || './raw';
  const outputPath = process.env.OUTPUT_PATH || './docs-site/docs';

  synthesizeHooks({
    extractionsPath,
    outputPath,
  }).catch((err) => {
    console.error('Hooks generation failed:', err);
    process.exit(1);
  });
}
