import { join } from 'path';
import { existsSync } from 'fs';
import { createLogger } from '../utils/logger.js';
import { writeJSON, readJSON } from '../utils/files.js';
import { extractRuntime } from './runtime.js';
import type { FullExtraction, RuntimeExtraction } from '../schemas/extraction.js';

const log = createLogger('extract');

interface ExtractAllOptions {
  reposPath: string;
  outputPath: string;
  layers?: ('L1' | 'L2' | 'L3' | 'L4' | 'wasm')[];
}

export async function extractAll(options: ExtractAllOptions): Promise<void> {
  const { reposPath, outputPath, layers = ['L1', 'L2', 'L3', 'L4'] } = options;

  log.section('Hydration Codex - Full Extraction');
  log.info(`Repos: ${reposPath}`);
  log.info(`Output: ${outputPath}`);
  log.info(`Layers: ${layers.join(', ')}`);

  const results: Partial<FullExtraction> = {
    extractedAt: new Date().toISOString(),
  };

  // L1: Runtime
  if (layers.includes('L1')) {
    const runtimePath = join(reposPath, 'hydration-node');
    if (existsSync(runtimePath)) {
      log.section('L1: Runtime Extraction');
      const runtimeOutput = join(outputPath, 'runtime');

      // Get previous commit for change detection
      const prevMeta = readJSON<RuntimeExtraction>(join(runtimeOutput, 'extraction.json'));
      const previousCommit = prevMeta?.meta.source.commit;

      results.runtime = await extractRuntime({
        repoPath: runtimePath,
        outputPath: runtimeOutput,
        previousCommit,
      });
    } else {
      log.warn('hydration-node not found, skipping L1');
    }
  }

  // L2: SDK (placeholder - would implement similarly)
  if (layers.includes('L2')) {
    const sdkPath = join(reposPath, 'sdk');
    if (existsSync(sdkPath)) {
      log.section('L2: SDK Extraction');
      log.warn('SDK extraction not yet implemented in TypeScript');
      // results.sdk = await extractSDK({ ... });
    } else {
      log.warn('sdk not found, skipping L2');
    }
  }

  // L3: Indexer (placeholder)
  if (layers.includes('L3')) {
    const indexerPath = join(reposPath, 'indexer');
    if (existsSync(indexerPath)) {
      log.section('L3: Indexer Extraction');
      log.warn('Indexer extraction not yet implemented in TypeScript');
      // results.indexer = await extractIndexer({ ... });
    } else {
      log.warn('indexer not found, skipping L3');
    }
  }

  // L4: UI (placeholder)
  if (layers.includes('L4')) {
    const uiPath = join(reposPath, 'hydration-ui');
    if (existsSync(uiPath)) {
      log.section('L4: UI Extraction');
      log.warn('UI extraction not yet implemented in TypeScript');
      // results.ui = await extractUI({ ... });
    } else {
      log.warn('hydration-ui not found, skipping L4');
    }
  }

  // Write combined results
  writeJSON(join(outputPath, 'full-extraction.json'), results);
  log.success(`Full extraction written to ${outputPath}/full-extraction.json`);
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const reposPath = process.env.REPOS_PATH || './repos';
  const outputPath = process.env.OUTPUT_PATH || './knowledge-base/raw';

  extractAll({ reposPath, outputPath })
    .catch((err) => {
      console.error('Extraction failed:', err);
      process.exit(1);
    });
}
