import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, symlinkSync, readlinkSync } from 'fs';
import { createLogger } from '../utils/logger.js';
import { writeJSON, readJSON } from '../utils/files.js';
import { getGitInfo } from '../utils/git.js';
import { extractRuntime } from './runtime.js';
import { extractSDK } from './sdk.js';
import { extractIndexer } from './indexer.js';
import { extractUI } from './ui.js';
import type { FullExtraction, RuntimeExtraction } from '../schemas/extraction.js';

const log = createLogger('extract');

// Per-repo extraction structure:
// extractions/
//   runtime/<commit>.json, latest -> <commit>.json
//   sdk/<commit>.json, latest -> <commit>.json
//   indexer/<commit>.json, latest -> <commit>.json
//   ui/<commit>.json, latest -> <commit>.json

function getShortCommit(commit: string): string {
  return commit.slice(0, 7);
}

function getLatestCommit(layerDir: string): string | null {
  const latestPath = join(layerDir, 'latest');
  if (!existsSync(latestPath)) return null;
  try {
    const target = readlinkSync(latestPath);
    // target is like "abc1234.json"
    return target.replace('.json', '');
  } catch {
    return null;
  }
}

function updateLayerSymlink(layerDir: string, commit: string): void {
  const shortCommit = getShortCommit(commit);
  const latestPath = join(layerDir, 'latest');
  const target = `${shortCommit}.json`;
  try {
    if (existsSync(latestPath)) unlinkSync(latestPath);
    symlinkSync(target, latestPath);
  } catch {
    log.warn(`Could not create symlink: ${latestPath}`);
  }
}

interface ExtractAllOptions {
  reposPath: string;
  outputPath: string;
  layers?: ('L1' | 'L2' | 'L3' | 'L4')[];
  forceExtract?: boolean;
}

export async function extractAll(options: ExtractAllOptions): Promise<FullExtraction> {
  const {
    reposPath,
    outputPath: baseOutputPath,
    layers = ['L1', 'L2', 'L3', 'L4'],
    forceExtract = false,
  } = options;

  log.section('Hydration Codex - Extraction');
  log.info(`Repos: ${reposPath}`);
  log.info(`Output: ${baseOutputPath}`);
  log.info(`Layers: ${layers.join(', ')}`);

  // Create layer directories
  const layerDirs = {
    runtime: join(baseOutputPath, 'runtime'),
    sdk: join(baseOutputPath, 'sdk'),
    indexer: join(baseOutputPath, 'indexer'),
    ui: join(baseOutputPath, 'ui'),
  };
  for (const dir of Object.values(layerDirs)) {
    mkdirSync(dir, { recursive: true });
  }

  const results: Partial<FullExtraction> = {
    extractedAt: new Date().toISOString(),
  };

  // L1: Runtime
  if (layers.includes('L1')) {
    const runtimePath = join(reposPath, 'hydration-node');
    if (existsSync(runtimePath)) {
      const gitInfo = getGitInfo(runtimePath);
      const shortCommit = getShortCommit(gitInfo.commit);
      const outputFile = join(layerDirs.runtime, `${shortCommit}.json`);

      // Skip if already extracted (unless forced)
      if (existsSync(outputFile) && !forceExtract) {
        log.info(`L1: Reusing existing extraction for ${shortCommit}`);
        results.runtime = readJSON<RuntimeExtraction>(outputFile) || undefined;
      } else {
        log.section('L1: Runtime Extraction');
        results.runtime = await extractRuntime({
          repoPath: runtimePath,
          outputPath: layerDirs.runtime,
        });
        // Rename extraction.json to <commit>.json
        const extractionFile = join(layerDirs.runtime, 'extraction.json');
        if (existsSync(extractionFile)) {
          const data = readJSON(extractionFile);
          writeJSON(outputFile, data);
          unlinkSync(extractionFile);
        }
      }
      updateLayerSymlink(layerDirs.runtime, gitInfo.commit);
    } else {
      log.warn('hydration-node not found, skipping L1');
    }
  }

  // L2: SDK
  if (layers.includes('L2')) {
    const sdkPath = join(reposPath, 'sdk');
    if (existsSync(sdkPath)) {
      const gitInfo = getGitInfo(sdkPath);
      const shortCommit = getShortCommit(gitInfo.commit);
      const outputFile = join(layerDirs.sdk, `${shortCommit}.json`);

      if (existsSync(outputFile) && !forceExtract) {
        log.info(`L2: Reusing existing extraction for ${shortCommit}`);
        results.sdk = readJSON(outputFile) || undefined;
      } else {
        log.section('L2: SDK Extraction');
        results.sdk = await extractSDK({
          repoPath: sdkPath,
          outputPath: layerDirs.sdk,
        });
        const extractionFile = join(layerDirs.sdk, 'extraction.json');
        if (existsSync(extractionFile)) {
          const data = readJSON(extractionFile);
          writeJSON(outputFile, data);
          unlinkSync(extractionFile);
        }
      }
      updateLayerSymlink(layerDirs.sdk, gitInfo.commit);
    } else {
      log.warn('sdk not found, skipping L2');
    }
  }

  // L3: Indexer
  if (layers.includes('L3')) {
    const indexerPath = join(reposPath, 'indexer');
    if (existsSync(indexerPath)) {
      const gitInfo = getGitInfo(indexerPath);
      const shortCommit = getShortCommit(gitInfo.commit);
      const outputFile = join(layerDirs.indexer, `${shortCommit}.json`);

      if (existsSync(outputFile) && !forceExtract) {
        log.info(`L3: Reusing existing extraction for ${shortCommit}`);
        results.indexer = readJSON(outputFile) || undefined;
      } else {
        log.section('L3: Indexer Extraction');
        results.indexer = await extractIndexer({
          repoPath: indexerPath,
          outputPath: layerDirs.indexer,
        });
        const extractionFile = join(layerDirs.indexer, 'extraction.json');
        if (existsSync(extractionFile)) {
          const data = readJSON(extractionFile);
          writeJSON(outputFile, data);
          unlinkSync(extractionFile);
        }
      }
      updateLayerSymlink(layerDirs.indexer, gitInfo.commit);
    } else {
      log.warn('indexer not found, skipping L3');
    }
  }

  // L4: UI
  if (layers.includes('L4')) {
    const uiPath = join(reposPath, 'hydration-ui');
    if (existsSync(uiPath)) {
      const gitInfo = getGitInfo(uiPath);
      const shortCommit = getShortCommit(gitInfo.commit);
      const outputFile = join(layerDirs.ui, `${shortCommit}.json`);

      if (existsSync(outputFile) && !forceExtract) {
        log.info(`L4: Reusing existing extraction for ${shortCommit}`);
        results.ui = readJSON(outputFile) || undefined;
      } else {
        log.section('L4: UI Extraction');
        results.ui = await extractUI({
          repoPath: uiPath,
          outputPath: layerDirs.ui,
        });
        const extractionFile = join(layerDirs.ui, 'extraction.json');
        if (existsSync(extractionFile)) {
          const data = readJSON(extractionFile);
          writeJSON(outputFile, data);
          unlinkSync(extractionFile);
        }
      }
      updateLayerSymlink(layerDirs.ui, gitInfo.commit);
    } else {
      log.warn('hydration-ui not found, skipping L4');
    }
  }

  log.section('Extraction Complete');
  log.success(`Runtime: ${results.runtime?.meta.source.commit?.slice(0, 7) || 'N/A'}`);
  log.success(`SDK: ${(results.sdk as { meta?: { source?: { commit?: string } } })?.meta?.source?.commit?.slice(0, 7) || 'N/A'}`);
  log.success(`Indexer: ${results.indexer?.meta.source.commit?.slice(0, 7) || 'N/A'}`);
  log.success(`UI: ${results.ui?.meta.source.commit?.slice(0, 7) || 'N/A'}`);

  return results as FullExtraction;
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const reposPath = process.env.REPOS_PATH || './repos';
  const outputPath = process.env.OUTPUT_PATH || './extractions';
  const forceExtract = process.env.FORCE_EXTRACT === 'true';

  extractAll({
    reposPath,
    outputPath,
    forceExtract,
  }).catch((err) => {
    console.error('Extraction failed:', err);
    process.exit(1);
  });
}

// Export helpers for diff tooling
export { getShortCommit, getLatestCommit };
