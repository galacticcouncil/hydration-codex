import chalk from 'chalk';

export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

export interface Logger {
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
  step(message: string): void;
  section(title: string): void;
}

export function createLogger(prefix: string): Logger {
  const timestamp = () => new Date().toISOString().split('T')[1].slice(0, 8);

  return {
    info: (msg) => console.log(chalk.blue(`[${timestamp()}] [${prefix}]`), msg),
    success: (msg) => console.log(chalk.green(`[${timestamp()}] [${prefix}]`), '✓', msg),
    warn: (msg) => console.log(chalk.yellow(`[${timestamp()}] [${prefix}]`), '⚠', msg),
    error: (msg) => console.log(chalk.red(`[${timestamp()}] [${prefix}]`), '✗', msg),
    debug: (msg) => {
      if (process.env.DEBUG) {
        console.log(chalk.gray(`[${timestamp()}] [${prefix}]`), msg);
      }
    },
    step: (msg) => console.log(chalk.cyan(`  →`), msg),
    section: (title) => {
      console.log('');
      console.log(chalk.bold.white(`=== ${title} ===`));
    },
  };
}

export const log = createLogger('codex');
