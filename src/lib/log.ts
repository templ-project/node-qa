import chalk from 'chalk';
import * as emoji from 'node-emoji';

export const warning = (message: string) => {
  console.error(chalk.yellow(`⚠ ${message}`));
};

export const error = (message: string, exitCode = 0) => {
  console.error(chalk.red(`✖ ${message}`));
  if (exitCode > 0) {
    process.exit(exitCode);
  }
};

export const success = (message: string) => {
  console.log(`${chalk.green(emoji.emojify(':heavy_check_mark:'))} ${message}`);
};

export const info = (message: string | string[]) => {
  if (Array.isArray(message)) {
    console.log(chalk.blue(message.map((m) => `» ${m}`).join('\n\r')));
    return;
  }
  console.log(chalk.blue(`» ${message}`));
};

export const newLine = () => console.log('');
