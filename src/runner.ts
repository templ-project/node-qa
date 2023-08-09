import {NodeQaArgs, VerboseLevelPrintAllScriptsOutputs, VerboseLevelPrintFailingScriptsOutput} from './args.js';
import {NodeQaConfig, defaultNodeQaConfig} from './config.js';
import {Module, findGlobalModuleBinary, findLocalModuleBinary, hasModule, osExtensions} from './lib/detect.js';
import {moduleFailedRunning, modulesFailedRunning, modulesNotInstalled} from './lib/errors.js';

import * as log from './lib/log.js';
import {spawn, defaultSpawnOptionsWithOutput, defaultSpawnOptions} from './lib/spawn.js';
import chalk from 'chalk';
import {cosmiconfig} from 'cosmiconfig';
import merge from 'lodash.merge';

import ora from 'ora';

const loadConfig = async () => {
  const explorer = cosmiconfig('nodeqa');
  const result = await explorer.search();

  const localConfig = {
    ...defaultNodeQaConfig,
    ...(result?.config || {}),
  };

  if (localConfig.modules?.length > 0) {
    localConfig.modules = localConfig.modules
      ?.map((m: Module | string) => (typeof m !== 'string' ? m : {name: m}))
      .map((m: Module) => merge(defaultNodeQaConfig.modules?.find((mm) => mm.name == m.name), m));
  } else {
    localConfig.modules = defaultNodeQaConfig.modules;
  }

  return {...defaultNodeQaConfig, ...localConfig};
};

const mapRunList = async (config: NodeQaConfig) => {
  log.info('Detecting dependencies...');

  const foundModules: Module[] = [];
  const missingModules: Module[] = [];

  for (const m of config.modules || []) {
    const spinner = ora(`Finding ${chalk.yellow(m.name)}`).start();

    const result = hasModule(m.moduleName ?? m.name);
    if (!result.found) {
      missingModules.push(m);
      spinner.fail(`Missing ${chalk.red(m.name)}`).stop();
    } else {
      m.binary =
        (result.type === 'global'
          ? findGlobalModuleBinary(m.binary ?? m.moduleName ?? m.name, osExtensions())
          : findLocalModuleBinary(m.binary ?? m.moduleName ?? m.name, osExtensions())) || undefined;
      foundModules.push(m);
      spinner.succeed(`Found ${chalk.green(m.name)}`).stop();
    }
  }

  if (missingModules.length > 0 && !config.ignoreMissingModules) {
    log.error(`Missing modules: ${missingModules.map((m) => m.name).join(', ')}; stopping...`, modulesNotInstalled);
  }

  return foundModules;
};

const printStartMessage = (m: Module) => {
  const argsString = m.args ? chalk.gray(m.args.join(' ')) : '';
  return `Running ${chalk.yellow(m.name)} ${argsString}`;
};

const printFailMessage = ({name}: Module) => `Failed running ${chalk.red(name)}`;

const printSuccessMessage = ({name}: Module) => `Ran ${chalk.green(name)}`;

const printVerboseOutput = (stdout: string, stderr: string) => {
  console.log(stdout);
  console.log(stderr);
};

const runModule = async (m: Module, verbose: number = 0): Promise<string | null> => {
  let spinner;

  if (verbose < VerboseLevelPrintAllScriptsOutputs) {
    spinner = ora(printStartMessage(m)).start();
  } else {
    log.info(printStartMessage(m));
  }

  const {code, stdout, stderr} = await spawn(
    m.binary || 'npm',
    m.args || [],
    verbose < VerboseLevelPrintAllScriptsOutputs ? defaultSpawnOptions : defaultSpawnOptionsWithOutput,
    true,
  );

  if ((code || 0) > 0) {
    if (spinner) {
      spinner.fail(printFailMessage(m)).stop();
      if (verbose === VerboseLevelPrintFailingScriptsOutput) {
        printVerboseOutput(stdout, stderr);
      }
    } else {
      log.error(printFailMessage(m), moduleFailedRunning);
    }
    return m.name;
  }

  if (spinner) {
    spinner.succeed(printSuccessMessage(m)).stop();
  } else {
    log.info(chalk.green('done'));
  }
  return null;
};

const runList = async (_config: NodeQaConfig, args: NodeQaArgs, list: Module[] = []) => {
  log.info('Running modules...');

  const failed = [];
  const {verbose = 0} = args;

  for (const m of list) {
    const failedModuleName = await runModule(m, verbose);
    if (failedModuleName) {
      failed.push(failedModuleName);
    }

    if (verbose > VerboseLevelPrintFailingScriptsOutput) {
      log.newLine();
    }
  }

  if (failed.length) {
    log.error(`Failed running modules: ${failed.join(', ')}`, modulesFailedRunning);
  }
};

export const run = async (args: NodeQaArgs) => {
  const config = await loadConfig();

  const list = await mapRunList(config);

  log.newLine();

  await runList(config, args, list);
};
