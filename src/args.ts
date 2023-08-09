import {Command} from 'commander';
import * as log from './lib/log.js';

export type NodeQaArgs = {
  config?: string;
  configure?: boolean;
  verbose?: number;
};

let args: NodeQaArgs = {};

function readArgs() {
  const program = new Command();

  program
    .version('0.0.1')
    .option('-c, --config <config>', 'Path to the configuration file')
    .option('--configure', 'Generate the configuration file')
    .option('-v, --verbose', 'Set verbosity level', (_v: string, total: number) => total + 1, 0); // Default is 0
  // .option('-e, --ide <ide>', `configure an IDE: ${Object.values(supportedIdes).join(', ')}`, supportedIdes.VSCODE)
  // .option(
  //     '-vsccm, --vscode-cpp-module <vscodeCppModule>',
  //     `configure VSCode to a specific C/C++ module: ${Object.values(supportedVscCppModules).join(', ')}`,
  //     supportedVscCppModules.VSCODE_CLANGD,
  // )
  // .option('-omc, --overwrite-main-cc', 'overwrite main.cc content with default standard code from template')
  // .option(
  //     '-cs, --c-standard <cStandards>',
  //     `C Standard (set the most important as last value): ${Object.keys(supportedCStandards)}`,
  //     (value, previous) => [...new Set(previous.concat([value]))],
  //     [supportedCStandards.c11],
  // )
  // .option(
  //     '-cpps, --cpp-standard <cppStandards>',
  //     `C++ Standard (set the most important as last value): ${Object.keys(supportedCppStandards)}`,
  //     (value, previous) => [...new Set(previous.concat([value]))],
  //     [supportedCppStandards.cxx11],
  // );

  program.parse(process.argv);

  return program.opts();
}

if (Object.keys(args).length === 0) {
  args = readArgs();
}

export const VerboseLevelPrintFailingScriptsOutput = 1;
export const VerboseLevelPrintAllScriptsOutputs = 2;
export const VerbosePrintEverything = 3;

if (args.verbose === VerbosePrintEverything) {
  log.info(`Starting with args: ${JSON.stringify(args)}`);
}

export {args};
