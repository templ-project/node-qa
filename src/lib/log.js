import chalk from 'chalk';
import * as emoji from 'node-emoji';

/**
 *
 * @param {string} message
 * @param {boolean} exit default: true
 */
export const error = (message, exit = true) => {
  // console.error(exit ? chalk.red(`${emoji.unemojify('✖')} ${message}`) : chalk.yellow(message));
  console.error(exit ? chalk.red(`✖ ${message}`) : chalk.yellow(`⚠ ${message}`));
  if (exit) {
    process.exit(1);
  }
};

/**
 *
 * @param {string} message
 */
export const success = (message) => {
  console.log(`${chalk.green(emoji.emojify(':heavy_check_mark:'))} ${message}`);
};

/**
 *
 * @param {string} message
 */
export const info = (message) => {
  if (Array.isArray(message)) {
    console.log(chalk.blue(message.map((m) => `» ${m}`).join('\n\r')));
    return;
  }
  console.log(chalk.blue(`» ${message}`));
};

/**
 *
 * @returns {void}
 */
export const newLine = () => console.log('');
