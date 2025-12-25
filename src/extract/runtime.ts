import { join } from 'path';
import { existsSync, readdirSync } from 'fs';
import * as TOML from 'toml';
import { createLogger } from '../utils/logger.js';
import { readFile, writeJSON, findFiles, grepFiles } from '../utils/files.js';
import { getGitInfo, getChangedFiles, getChangedPallets } from '../utils/git.js';
import type {
  RuntimeExtraction,
  Pallet,
  StorageItem,
  Extrinsic,
  Event,
  ErrorSchema,
} from '../schemas/extraction.js';

const log = createLogger('L1:runtime');

interface ExtractOptions {
  repoPath: string;
  outputPath: string;
  previousCommit?: string;
}

// ===========================================
// Pallet Discovery
// ===========================================

function discoverPallets(repoPath: string): Array<{ name: string; path: string; packageName: string }> {
  const palletsDir = join(repoPath, 'pallets');
  if (!existsSync(palletsDir)) {
    log.warn('pallets/ directory not found');
    return [];
  }

  const pallets: Array<{ name: string; path: string; packageName: string }> = [];
  const entries = readdirSync(palletsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const palletPath = join(palletsDir, entry.name);
    const cargoPath = join(palletPath, 'Cargo.toml');

    if (!existsSync(cargoPath)) continue;

    const cargoContent = readFile(cargoPath);
    if (!cargoContent) continue;

    try {
      const cargo = TOML.parse(cargoContent);
      const packageName = cargo.package?.name || `pallet-${entry.name}`;
      pallets.push({
        name: entry.name,
        path: palletPath,
        packageName,
      });
    } catch {
      log.warn(`Failed to parse ${cargoPath}`);
    }
  }

  return pallets;
}

// ===========================================
// Storage Extraction
// ===========================================

function extractStorage(repoPath: string, palletName: string): StorageItem[] {
  const pattern = /^pallets\/${palletName}\/src\/**\/*.rs$/;
  const storagePattern = /#\[pallet::storage\]/;

  const matches = grepFiles(
    repoPath,
    `pallets/${palletName}/src/**/*.rs`,
    /#\[pallet::storage\]/
  );

  const items: StorageItem[] = [];

  for (const match of matches) {
    // Get the next few lines to extract the storage name
    const content = readFile(join(repoPath, match.file));
    if (!content) continue;

    const lines = content.split('\n');
    for (let i = match.line; i < Math.min(match.line + 10, lines.length); i++) {
      const line = lines[i];
      // Look for: pub type StorageName = StorageValue<...> or StorageMap<...>
      const storageMatch = line.match(/pub\s+type\s+(\w+)\s*=/);
      if (storageMatch) {
        items.push({
          pallet: palletName,
          name: storageMatch[1],
          type: line.includes('StorageMap') ? 'map' :
                line.includes('StorageDoubleMap') ? 'double_map' :
                line.includes('StorageNMap') ? 'n_map' : 'value',
          file: match.file,
          line: i + 1,
        });
        break;
      }
    }
  }

  return items;
}

// ===========================================
// Extrinsic Extraction
// ===========================================

function extractExtrinsics(repoPath: string, palletName: string): Extrinsic[] {
  const matches = grepFiles(
    repoPath,
    `pallets/${palletName}/src/**/*.rs`,
    /pub\s+fn\s+(\w+)\s*\(/
  );

  const extrinsics: Extrinsic[] = [];

  for (const match of matches) {
    const content = readFile(join(repoPath, match.file));
    if (!content) continue;

    const lines = content.split('\n');

    // Check if this is inside a #[pallet::call] block and returns DispatchResult
    let inCallBlock = false;
    for (let i = Math.max(0, match.line - 20); i < match.line; i++) {
      if (lines[i].includes('#[pallet::call]')) {
        inCallBlock = true;
        break;
      }
    }

    if (!inCallBlock) continue;

    // Check for DispatchResult return type
    const lineContent = lines.slice(match.line - 1, match.line + 5).join(' ');
    if (!lineContent.includes('DispatchResult')) continue;

    // Extract function name
    const fnMatch = match.content.match(/pub\s+fn\s+(\w+)/);
    if (!fnMatch) continue;

    // Extract parameters (simplified)
    const paramsMatch = lineContent.match(/\(([^)]+)\)/);
    const params: Array<{ name: string; type: string }> = [];

    if (paramsMatch) {
      const paramsStr = paramsMatch[1];
      const paramParts = paramsStr.split(',');
      for (const param of paramParts) {
        const paramMatch = param.trim().match(/(\w+)\s*:\s*(.+)/);
        if (paramMatch && paramMatch[1] !== 'origin') {
          params.push({
            name: paramMatch[1],
            type: paramMatch[2].trim(),
          });
        }
      }
    }

    extrinsics.push({
      pallet: palletName,
      name: fnMatch[1],
      params,
      file: match.file,
      line: match.line,
    });
  }

  return extrinsics;
}

// ===========================================
// Event Extraction
// ===========================================

function extractEvents(repoPath: string, palletName: string): Event[] {
  const matches = grepFiles(
    repoPath,
    `pallets/${palletName}/src/**/*.rs`,
    /#\[pallet::event\]/
  );

  const events: Event[] = [];

  for (const match of matches) {
    const content = readFile(join(repoPath, match.file));
    if (!content) continue;

    const lines = content.split('\n');

    // Find enum Event declaration and extract variants
    for (let i = match.line; i < Math.min(match.line + 100, lines.length); i++) {
      const line = lines[i];

      // Match event variant: EventName { field: Type, ... } or EventName(Type, ...)
      const variantMatch = line.match(/^\s+(\w+)\s*[\{(]/);
      if (variantMatch && /^[A-Z]/.test(variantMatch[1])) {
        events.push({
          pallet: palletName,
          name: variantMatch[1],
          fields: [], // Simplified - could parse fields
          file: match.file,
          line: i + 1,
        });
      }

      // Stop at end of enum
      if (line.match(/^\s*\}/)) break;
    }
  }

  return events;
}

// ===========================================
// Main Extraction
// ===========================================

export async function extractRuntime(options: ExtractOptions): Promise<RuntimeExtraction> {
  const { repoPath, outputPath, previousCommit } = options;

  log.section('Hydration Runtime (L1) Extraction');
  log.info(`Source: ${repoPath}`);
  log.info(`Output: ${outputPath}`);

  // Git info
  const gitInfo = getGitInfo(repoPath);
  log.step(`Commit: ${gitInfo.commit.slice(0, 7)} (${gitInfo.branch})`);

  // Discover pallets
  log.section('Discovering Pallets');
  const palletInfos = discoverPallets(repoPath);
  log.success(`Found ${palletInfos.length} pallets`);

  // Extract each pallet
  log.section('Extracting Pallets');
  const pallets: Pallet[] = [];
  let totalStorage = 0;
  let totalExtrinsics = 0;
  let totalEvents = 0;
  let totalErrors = 0;

  for (const info of palletInfos) {
    log.step(`${info.name}`);

    const storage = extractStorage(repoPath, info.name);
    const extrinsics = extractExtrinsics(repoPath, info.name);
    const events = extractEvents(repoPath, info.name);

    pallets.push({
      name: info.name,
      packageName: info.packageName,
      path: info.path,
      storage,
      extrinsics,
      events,
      errors: [], // Simplified
    });

    totalStorage += storage.length;
    totalExtrinsics += extrinsics.length;
    totalEvents += events.length;
  }

  // Extract construct_runtime
  log.section('Extracting Runtime Configuration');
  const runtimeLibPath = join(repoPath, 'runtime/hydradx/src/lib.rs');
  const runtimeContent = readFile(runtimeLibPath) || '';
  const constructRuntimeMatch = runtimeContent.match(/construct_runtime!\s*\{[\s\S]*?\n\s*\}/);
  log.success('construct_runtime! extracted');

  // Extract node files
  log.section('Extracting Node Implementation');
  const nodeFiles = findFiles('node/src/**/*.rs', repoPath);
  log.success(`${nodeFiles.length} node files found`);

  // Extract EVM
  log.section('Extracting EVM Configuration');
  const evmFiles = findFiles('runtime/hydradx/src/evm/**/*.rs', repoPath);
  const precompiles = readdirSync(join(repoPath, 'precompiles'), { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  log.success(`${evmFiles.length} EVM files, ${precompiles.length} precompiles`);

  // Change detection
  let changedFiles: string[] = [];
  let changedPallets: string[] = [];
  if (previousCommit && previousCommit !== gitInfo.commit) {
    log.section('Detecting Changes');
    changedFiles = getChangedFiles(repoPath, previousCommit, gitInfo.commit);
    changedPallets = getChangedPallets(changedFiles);
    log.success(`${changedFiles.length} files changed, ${changedPallets.length} pallets affected`);
  }

  // Build result
  const result: RuntimeExtraction = {
    meta: {
      layer: 'L1',
      name: 'runtime',
      extractedAt: new Date().toISOString(),
      source: gitInfo,
      previousCommit,
    },
    pallets,
    runtime: {
      constructRuntime: constructRuntimeMatch?.[0] || '',
    },
    node: {
      files: nodeFiles,
    },
    evm: {
      files: evmFiles,
      precompiles,
    },
    statistics: {
      palletsCount: pallets.length,
      storageItems: totalStorage,
      extrinsics: totalExtrinsics,
      events: totalEvents,
      errors: totalErrors,
    },
    changedFiles: changedFiles.length > 0 ? changedFiles : undefined,
    changedPallets: changedPallets.length > 0 ? changedPallets : undefined,
  };

  // Write output
  writeJSON(join(outputPath, 'extraction.json'), result);
  log.success(`Output written to ${outputPath}/extraction.json`);

  // Summary
  log.section('Extraction Complete');
  console.log(`
  Pallets:     ${result.statistics.palletsCount}
  Storage:     ${result.statistics.storageItems}
  Extrinsics:  ${result.statistics.extrinsics}
  Events:      ${result.statistics.events}
  Node Files:  ${result.node.files.length}
  EVM Files:   ${result.evm.files.length}
  Precompiles: ${result.evm.precompiles.length}
  `);

  return result;
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const repoPath = process.env.REPO_PATH || './repos/hydration-node';
  const outputPath = process.env.OUTPUT_PATH || './knowledge-base/raw/runtime';

  extractRuntime({ repoPath, outputPath })
    .catch((err) => {
      console.error('Extraction failed:', err);
      process.exit(1);
    });
}
