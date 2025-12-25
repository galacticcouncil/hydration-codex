import { execSync } from 'child_process';
import type { GitInfo } from '../schemas/extraction.js';

export function getGitInfo(repoPath: string): GitInfo {
  const exec = (cmd: string) => {
    try {
      return execSync(cmd, { cwd: repoPath, encoding: 'utf-8' }).trim();
    } catch {
      return 'unknown';
    }
  };

  return {
    commit: exec('git rev-parse HEAD'),
    branch: exec('git rev-parse --abbrev-ref HEAD'),
    repo: exec('git remote get-url origin').replace(/.*github\.com[:/]/, '').replace(/\.git$/, ''),
  };
}

export function getChangedFiles(repoPath: string, fromCommit: string, toCommit: string): string[] {
  try {
    const output = execSync(
      `git diff --name-only ${fromCommit} ${toCommit}`,
      { cwd: repoPath, encoding: 'utf-8' }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

export function getChangedPallets(changedFiles: string[]): string[] {
  const palletPattern = /^pallets\/([^/]+)\//;
  const pallets = new Set<string>();

  for (const file of changedFiles) {
    const match = file.match(palletPattern);
    if (match) {
      pallets.add(match[1]);
    }
  }

  return Array.from(pallets);
}
