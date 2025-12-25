import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import fg from 'fast-glob';

export function readFile(path: string): string | null {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

export function writeFile(path: string, content: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(path, content, 'utf-8');
}

export function writeJSON(path: string, data: unknown): void {
  writeFile(path, JSON.stringify(data, null, 2));
}

export function readJSON<T>(path: string): T | null {
  const content = readFile(path);
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function glob(pattern: string, cwd: string): Promise<string[]> {
  return fg(pattern, {
    cwd,
    absolute: false,
    ignore: ['**/node_modules/**', '**/target/**', '**/.git/**'],
  });
}

export function findFiles(pattern: string, cwd: string): string[] {
  return fg.sync(pattern, {
    cwd,
    absolute: false,
    ignore: ['**/node_modules/**', '**/target/**', '**/.git/**'],
  });
}

export function grepFile(
  filePath: string,
  pattern: RegExp
): Array<{ line: number; match: string; content: string }> {
  const content = readFile(filePath);
  if (!content) return [];

  const results: Array<{ line: number; match: string; content: string }> = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineContent = lines[i];
    const match = lineContent.match(pattern);
    if (match) {
      results.push({
        line: i + 1,
        match: match[0],
        content: lineContent.trim(),
      });
    }
  }

  return results;
}

export function grepFiles(
  cwd: string,
  filePattern: string,
  searchPattern: RegExp
): Array<{ file: string; line: number; match: string; content: string }> {
  const files = findFiles(filePattern, cwd);
  const results: Array<{ file: string; line: number; match: string; content: string }> = [];

  for (const file of files) {
    const filePath = join(cwd, file);
    const matches = grepFile(filePath, searchPattern);
    for (const m of matches) {
      results.push({ file, ...m });
    }
  }

  return results;
}
