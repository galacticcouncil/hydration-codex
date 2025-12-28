/**
 * SDK Pages Generator - Generate MDX pages for SDK packages
 *
 * Reads enhanced SDK extraction and generates documentation pages for each package:
 * - README documentation from source
 * - Method signatures with parameters and return types
 * - Per-method runtime calls (storage reads, consts, tx)
 * - Cross-references to UI hooks that use this package
 */

import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync, readFileSync } from 'fs';
import { createLogger } from '../utils/logger.js';

const log = createLogger('sdk');

// Enhanced extraction interfaces
interface PalletCall {
  pallet: string;
  item: string;
  type: 'query' | 'tx' | 'consts';
  line: number;
}

interface AggregatedCall {
  pallet: string;
  item: string;
  methods: string[];
}

interface EnhancedSDKExtraction {
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
  packages: EnhancedSDKPackage[];
  statistics: {
    packagesCount: number;
    methodsCount: number;
    typesCount: number;
    exportedMethodsCount: number;
    queryCalls: number;
    txCalls: number;
    constsCalls: number;
  };
}

interface EnhancedSDKPackage {
  name: string;
  version: string;
  path: string;
  methods: EnhancedMethod[];
  readme?: string;
  description?: string;
  types?: Array<{ name: string; kind: string; file: string; line: number; exported: boolean }>;
  palletCalls: {
    query: AggregatedCall[];
    tx: AggregatedCall[];
    consts: AggregatedCall[];
  };
}

interface EnhancedMethod {
  name: string;
  className?: string;
  file: string;
  line: number;
  description?: string;
  params: Array<{ name: string; type: string }>;
  returnType: string;
  isAsync: boolean;
  isExported: boolean;
  palletCalls: PalletCall[];
}

interface UIHook {
  name: string;
  file: string;
  category?: string;
}

interface SDKOptions {
  extractionsPath: string;
  outputPath: string;
}

// Priority packages (main SDK packages)
const PRIORITY_PACKAGES = [
  '@galacticcouncil/sdk',
  '@galacticcouncil/sdk-next',
  '@galacticcouncil/xcm-sdk',
  '@galacticcouncil/xc-sdk',
  '@galacticcouncil/common',
];

// Map pallet names to their canonical forms
const PALLET_NAME_MAP: Record<string, string> = {
  omnipool: 'Omnipool',
  stableswap: 'Stableswap',
  xyk: 'XYK',
  lbp: 'LBP',
  dca: 'DCA',
  router: 'Router',
  tokens: 'Tokens',
  balances: 'Balances',
  system: 'System',
  dynamicfees: 'DynamicFees',
  emaoracle: 'EmaOracle',
  assetregistry: 'AssetRegistry',
  multitransactionpayment: 'MultiTransactionPayment',
  bonds: 'Bonds',
  referrals: 'Referrals',
  staking: 'Staking',
  evm: 'EVM',
  hsm: 'HSM',
  uniques: 'Uniques',
  dispatcher: 'Dispatcher',
  omnipoolwarehouselm: 'OmnipoolWarehouseLM',
  xykwarehouselm: 'XYKWarehouseLM',
  parachainsystem: 'ParachainSystem',
  assets: 'Assets',
  foreignassets: 'ForeignAssets',
  evmaccounts: 'EvmAccounts',
  ethereum: 'Ethereum',
  ethereumxcm: 'EthereumXcm',
  aura: 'Aura',
};

function normalizePalletName(name: string): string {
  const lower = name.toLowerCase();
  return PALLET_NAME_MAP[lower] || name.charAt(0).toUpperCase() + name.slice(1);
}

export async function synthesizeSDK(options: SDKOptions): Promise<void> {
  const { extractionsPath, outputPath } = options;

  log.section('SDK Documentation Generation');

  // Load enhanced SDK extraction
  const extraction = loadEnhancedExtraction(extractionsPath);
  if (!extraction) {
    throw new Error('Missing SDK extraction. Run npm run extract:sdk:enhanced first.');
  }

  log.info(`Loaded ${extraction.packages.length} packages`);
  log.info(`Source: ${extraction.meta.source.repo}@${extraction.meta.source.branch}`);

  // Load UI extraction to find hooks that use SDK
  const uiExtraction = loadUIExtraction(extractionsPath);
  const hookIndex = loadHookIndex(outputPath);

  // Create output directory
  const sdkOutputPath = join(outputPath, 'reference/sdk');
  mkdirSync(sdkOutputPath, { recursive: true });

  // Sort packages: priority first, then by method count
  const sortedPackages = [...extraction.packages].sort((a, b) => {
    const aIdx = PRIORITY_PACKAGES.indexOf(a.name);
    const bIdx = PRIORITY_PACKAGES.indexOf(b.name);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return b.methods.length - a.methods.length;
  });

  // Filter to packages with methods
  const packagesWithMethods = sortedPackages.filter(p => p.methods.length > 0);

  log.section('Generating SDK Pages');

  let generatedCount = 0;

  for (const pkg of packagesWithMethods) {
    const shortName = getShortPackageName(pkg.name);

    // Find UI hooks that use this package
    const relatedHooks = findRelatedHooks(pkg.name, uiExtraction, hookIndex);

    const mdxContent = generatePackageMdx(pkg, extraction.meta, relatedHooks);
    // Use 'core-sdk' filename for 'sdk' package to avoid conflict with category index
    const fileName = shortName === 'sdk' ? 'core-sdk' : shortName;
    const filePath = join(sdkOutputPath, `${fileName}.mdx`);
    writeFileSync(filePath, mdxContent);
    generatedCount++;

    // Log pallet connections
    const totalCalls = (pkg.palletCalls.tx?.length || 0) +
                       (pkg.palletCalls.query?.length || 0) +
                       (pkg.palletCalls.consts?.length || 0);
    if (totalCalls > 0) {
      log.info(`  ${shortName}: ${totalCalls} storage items, ${relatedHooks.length} UI hooks`);
    }
  }

  log.info(`Generated ${generatedCount} package pages`);
  log.success(`Generated ${generatedCount} SDK pages`);

  log.section('Generation Complete');
  console.log(`\n  Output: ${sdkOutputPath}/`);
  console.log(`  Pages: ${generatedCount}\n`);
}

function loadEnhancedExtraction(baseDir: string): EnhancedSDKExtraction | null {
  const layerDir = join(baseDir, 'sdk');
  if (!existsSync(layerDir)) return null;

  // Try enhanced extraction first
  const enhancedPath = join(layerDir, 'extraction-enhanced.json');
  if (existsSync(enhancedPath)) {
    const content = readFileSync(enhancedPath, 'utf-8');
    return JSON.parse(content);
  }

  // Fall back to extraction.json
  const extractionPath = join(layerDir, 'extraction.json');
  if (existsSync(extractionPath)) {
    const content = readFileSync(extractionPath, 'utf-8');
    const old = JSON.parse(content);
    // Convert old format to enhanced format
    return convertOldFormat(old);
  }

  return null;
}

function convertOldFormat(old: any): EnhancedSDKExtraction {
  // Convert old extraction format to enhanced format
  return {
    meta: old.meta,
    packages: old.packages.map((pkg: any) => ({
      name: pkg.name,
      version: pkg.version,
      path: pkg.path,
      methods: (pkg.methods || []).map((m: any) => ({
        name: m.methodName || m.name,
        className: m.className,
        file: m.file,
        line: m.line,
        description: m.description,
        params: m.params || [],
        returnType: m.returnType || 'unknown',
        isAsync: m.isAsync || false,
        isExported: true,
        palletCalls: m.palletCalls || [],
      })),
      readme: pkg.readme,
      description: pkg.description,
      palletCalls: pkg.palletCalls || { query: [], tx: [], consts: [] },
    })),
    statistics: {
      packagesCount: old.packages?.length || 0,
      methodsCount: 0,
      typesCount: 0,
      exportedMethodsCount: 0,
      queryCalls: 0,
      txCalls: 0,
      constsCalls: 0,
    },
  };
}

function loadUIExtraction(baseDir: string): any | null {
  const paths = [
    join(baseDir, 'ui/extraction.json'),
    join(baseDir, 'ui/latest'),
  ];

  for (const p of paths) {
    if (existsSync(p)) {
      try {
        const content = readFileSync(p, 'utf-8');
        return JSON.parse(content);
      } catch {
        continue;
      }
    }
  }
  return null;
}

function loadHookIndex(outputPath: string): Record<string, { category: string; file: string }> {
  const indexPath = join(outputPath, '../static/hook-index.json');
  if (existsSync(indexPath)) {
    try {
      return JSON.parse(readFileSync(indexPath, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

function findRelatedHooks(
  packageName: string,
  uiExtraction: any,
  hookIndex: Record<string, { category: string; file: string }>
): UIHook[] {
  const hooks: UIHook[] = [];

  if (!uiExtraction?.hooks) return hooks;

  for (const hook of uiExtraction.hooks) {
    if (hook.usesSDK) {
      const hookInfo = hookIndex[hook.name];
      if (hookInfo) {
        hooks.push({
          name: hook.name,
          file: hook.file,
          category: hookInfo.category,
        });
      }
    }
  }

  return hooks;
}

function getShortPackageName(name: string): string {
  return name.replace('@galacticcouncil/', '').replace(/^@.*\//, '');
}

function buildGitHubLink(file: string, line: number, commit: string): string {
  const cleanPath = file.replace(/^repos\/sdk\//, '').replace(/^packages\//, 'packages/');
  return `https://github.com/galacticcouncil/sdk/blob/${commit}/${cleanPath}#L${line}`;
}

/**
 * Clean README content and convert relative links to absolute GitHub URLs
 */
function cleanReadmeContent(readme: string, packageName: string, commit: string): string {
  let content = readme;

  // Remove badge images
  content = content.replace(/^\s*\[!\[.*?\]\(.*?\)\]\(.*?\)\s*$/gm, '');
  content = content.replace(/^\s*!\[.*?\]\(.*?\)\s*$/gm, '');

  // Convert relative markdown links to absolute GitHub URLs
  // Matches: [text](relative/path.md) or [text](./relative/path)
  const baseUrl = `https://github.com/galacticcouncil/sdk/blob/${commit}/packages/${packageName}`;
  content = content.replace(
    /\[([^\]]+)\]\((?!https?:\/\/|#|mailto:)([^)]+)\)/g,
    (match, text, path) => {
      // Clean up the path
      const cleanPath = path.replace(/^\.\//, '');
      return `[${text}](${baseUrl}/${cleanPath})`;
    }
  );

  // Convert relative image sources to absolute GitHub raw URLs
  const rawBaseUrl = `https://raw.githubusercontent.com/galacticcouncil/sdk/${commit}/packages/${packageName}`;
  content = content.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
    (match, alt, path) => {
      const cleanPath = path.replace(/^\.\//, '');
      return `![${alt}](${rawBaseUrl}/${cleanPath})`;
    }
  );

  // Escape MDX-sensitive characters
  content = content.replace(/\{/g, '\\{');
  content = content.replace(/\}/g, '\\}');
  content = content.replace(/^\s*\n+/, '');

  return content.trim();
}

// External chain pallets (not in Hydration runtime)
const EXTERNAL_PALLETS: Record<string, string> = {
  'EvmAccounts': 'Moonbeam',
  'Assets': 'Asset Hub',
  'ForeignAssets': 'Asset Hub',
  'EthereumXcm': 'Moonbeam',
};

/**
 * Format a pallet reference - link if local, plain text with chain if external
 */
function formatPalletRef(pallet: string, item: string): string {
  const normalized = normalizePalletName(pallet);
  const externalChain = EXTERNAL_PALLETS[normalized];

  if (externalChain) {
    return `\`${normalized}.${item}\` (${externalChain})`;
  }
  return `[${normalized}.${item}](/reference/pallets/${normalized})`;
}

/**
 * Format pallet calls for display with links
 */
function formatPalletCallsInline(calls: PalletCall[]): string {
  if (calls.length === 0) return '';

  // Deduplicate and group by type
  const seen = new Set<string>();
  const items: string[] = [];

  for (const call of calls) {
    const key = `${call.type}:${call.pallet}.${call.item}`;
    if (seen.has(key)) continue;
    seen.add(key);

    items.push(formatPalletRef(call.pallet, call.item));
  }

  return items.join(', ');
}

function generatePackageMdx(
  pkg: EnhancedSDKPackage,
  meta: EnhancedSDKExtraction['meta'],
  relatedHooks: UIHook[]
): string {
  const shortName = getShortPackageName(pkg.name);
  const githubLink = `https://github.com/galacticcouncil/sdk/tree/${meta.source.commit}/packages/${shortName}`;
  const npmLink = `https://www.npmjs.com/package/${pkg.name}`;

  // For 'sdk' package, add explicit slug to avoid conflict with category index
  const needsSlug = shortName === 'sdk';

  const lines: string[] = [
    '---',
    `title: "${pkg.name}"`,
    `description: SDK package documentation`,
    `sidebar_label: ${shortName}`,
  ];
  if (needsSlug) {
    lines.push(`slug: sdk`);
  }
  lines.push('---');
  lines.push('');
  lines.push(`# ${pkg.name}`);
  lines.push('');

  // Add description from package.json if available
  if (pkg.description) {
    lines.push(pkg.description);
    lines.push('');
  }

  // Package info
  lines.push(`**Version:** ${pkg.version} | **Methods:** ${pkg.methods.length}`);
  lines.push('');
  lines.push(`**Links:** [GitHub](${githubLink}) | [npm](${npmLink})`);
  lines.push('');

  // Add README content if available - expanded by default
  if (pkg.readme) {
    const cleanedReadme = cleanReadmeContent(pkg.readme, shortName, meta.source.commit);
    const sections = cleanedReadme.split(/^## /m);
    if (sections.length > 1) {
      const intro = sections[0].replace(/^#\s+.*?\n/, '').trim();
      if (intro && intro.length > 50) {
        lines.push(cleanedReadme);
        lines.push('');
      }
    }
  }

  // Installation section
  lines.push('## Installation');
  lines.push('');
  lines.push('```bash');
  lines.push(`npm install ${pkg.name}`);
  lines.push('```');
  lines.push('');

  // Group methods by class
  const methodsByClass = new Map<string, EnhancedMethod[]>();
  for (const method of pkg.methods) {
    const className = method.className || 'Functions';
    if (!methodsByClass.has(className)) {
      methodsByClass.set(className, []);
    }
    methodsByClass.get(className)!.push(method);
  }

  // Sort: Functions first, then alphabetically
  const sortedClasses = [...methodsByClass.entries()].sort((a, b) => {
    if (a[0] === 'Functions') return -1;
    if (b[0] === 'Functions') return 1;
    return a[0].localeCompare(b[0]);
  });

  // Generate method sections grouped by class
  for (const [className, methods] of sortedClasses) {
    if (className === 'Functions') {
      lines.push('## Functions');
    } else {
      lines.push(`## ${className}`);
    }
    lines.push('');

    // Sort methods alphabetically within class
    const sortedMethods = [...methods].sort((a, b) => a.name.localeCompare(b.name));

    for (const method of sortedMethods) {
      const sourceLink = buildGitHubLink(method.file, method.line, meta.source.commit);
      lines.push(`### ${method.name}`);
      lines.push('');

      // Add description if available
      if (method.description) {
        lines.push(method.description);
        lines.push('');
      }

      // Generate signature
      const asyncPrefix = method.isAsync ? 'async ' : '';
      const params = formatParams(method.params);

      lines.push('```typescript');
      if (className !== 'Functions') {
        lines.push(`${asyncPrefix}${method.name}(${params}): ${method.returnType}`);
      } else {
        lines.push(`${asyncPrefix}function ${method.name}(${params}): ${method.returnType}`);
      }
      lines.push('```');
      lines.push('');

      // Show per-method pallet calls
      if (method.palletCalls && method.palletCalls.length > 0) {
        const callsText = formatPalletCallsInline(method.palletCalls);
        if (callsText) {
          lines.push(`**Reads:** ${callsText}`);
          lines.push('');
        }
      }

      lines.push(`[Source](${sourceLink})`);
      lines.push('');
    }
  }

  // References section at the bottom (Runtime + UI)
  const allQueries = pkg.palletCalls.query || [];
  const allTx = pkg.palletCalls.tx || [];
  const allConsts = pkg.palletCalls.consts || [];
  const allRuntimeItems = [...allQueries, ...allConsts, ...allTx];
  const hasRuntimeUsage = allRuntimeItems.length > 0;
  const hasUIUsage = relatedHooks.length > 0;

  if (hasRuntimeUsage || hasUIUsage) {
    lines.push('## References');
    lines.push('');

    // Runtime - bullet list
    if (hasRuntimeUsage) {
      lines.push(`### Runtime (${allRuntimeItems.length})`);
      lines.push('');
      for (const item of allRuntimeItems) {
        lines.push(`- ${formatPalletRef(item.pallet, item.item)}`);
      }
      lines.push('');
    }

    // UI hooks - bullet list
    if (hasUIUsage) {
      lines.push(`### UI (${relatedHooks.length})`);
      lines.push('');
      for (const hook of relatedHooks) {
        const category = hook.category || 'utils';
        lines.push(`- [${hook.name}](/reference/hooks/${category}/${hook.name})`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

function formatParams(params: Array<{ name: string; type: string }>): string {
  if (!params || params.length === 0) return '';

  return params.map(p => {
    // Simplify complex types for display
    let type = p.type;
    if (type.length > 50) {
      type = type.substring(0, 40) + '...';
    }
    return `${p.name}: ${type}`;
  }).join(', ');
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const extractionsPath = process.env.EXTRACTIONS_PATH || './extractions';
  const outputPath = process.env.OUTPUT_PATH || './docs-site/docs';

  synthesizeSDK({
    extractionsPath,
    outputPath,
  }).catch((err) => {
    console.error('SDK generation failed:', err);
    process.exit(1);
  });
}
