import {VerboseLevelPrintAllScriptsOutputs, VerboseLevelPrintFailingScriptsOutput} from './args.js';
import {defaultNodeQaConfig} from './config.js';
import {findGlobalModuleBinary, findLocalModuleBinary, hasModule, osExtensions} from './lib/detect.js';

import * as log from './lib/log.js';
import {spawn, defaultSpawnOptionsWithOutput, defaultSpawnOptions} from './lib/spawn.js';
import chalk from 'chalk';
import {cosmiconfig} from 'cosmiconfig';
import merge from 'lodash.merge';

import ora from 'ora';

const loadConfig = async () => {
  const explorer = cosmiconfig('nodeqa');
  const result = await explorer.search();
  // console.log(result);

  const localConfig = result?.config || {};

  if (localConfig.modules) {
    localConfig.modules = localConfig.modules
      ?.map((m) => (typeof m !== 'string' ? m : {name: m}))
      .map((m) =>
        merge(
          defaultNodeQaConfig.modules.find((mm) => mm.name == m.name),
          m,
        ),
      );
  }

  // console.log(localConfig.modules);
  // process.exit(0);

  return {...defaultNodeQaConfig, ...localConfig};
};

/**
 * @returns {Promise<Array<object>>}
 */
const mapRunList = async (config) => {
  log.info('Detecting dependencies...');

  const foundModules = [];
  const missingModules = [];

  for (let m of config.modules) {
    const spinner = ora(`Finding ${chalk.yellow(m.name)}`).start();

    const result = hasModule(m.name);
    if (!result.found) {
      missingModules.push(m);
      spinner.fail(`Missing ${chalk.red(m.name)}`).stop();
    } else {
      m.binary =
        (result.type === 'global'
          ? findGlobalModuleBinary(m.binary || m.name, osExtensions())
          : findLocalModuleBinary(m.binary || m.name, osExtensions())) || undefined;
      foundModules.push(m);
      spinner.succeed(`Found ${chalk.green(m.name)}`).stop();
    }
  }

  if (missingModules.length > 0 && !config.ignoreMissingModules) {
    log.error(`Missing modules: ${missingModules.map((m) => m.name).join(', ')}`);
  }

  return foundModules;
};

/**
 * @param {Array<object>} list
 * @returns {Promise<void>}
 */
const runList = async (config, args, list = []) => {
  log.info('Running modules...');

  const failed = [];
  const {verbose} = args;

  for (const m of list) {
    const {name: moduleName, binary, args} = m;
    let spinner;

    const startMessage = `Running ${chalk.yellow(m.name)} ${chalk.gray((args || []).join(' '))}`;
    const failMessage = `Failed running ${chalk.red(m.name)}`;

    if (verbose < VerboseLevelPrintAllScriptsOutputs) {
      spinner = ora(startMessage).start();
    } else {
      log.info(startMessage);
    }

    const {code, stdout, stderr} = await spawn(
      binary || 'npm',
      args || [],
      verbose < VerboseLevelPrintAllScriptsOutputs ? defaultSpawnOptions : defaultSpawnOptionsWithOutput,
      true,
    );

    if ((code || 0) > 0) {
      if (spinner) {
        spinner.fail(failMessage).stop();
        if (verbose === VerboseLevelPrintFailingScriptsOutput) {
          console.log(stdout);
          console.log(stderr);
        }
      } else {
        log.error(failMessage, false);
      }
      failed.push(m);
    } else {
      if (spinner) {
        spinner.succeed(`Ran ${chalk.green(m.name)}`).stop();
      } else {
        log.info(chalk.green(`done`));
      }
    }

    if (verbose > VerboseLevelPrintFailingScriptsOutput) {
      log.newLine();
    }
  }

  if (failed.length) {
    process.exit(1);
  }
};

export const run = async (args) => {
  const config = await loadConfig();
  // console.log(config);
  // process.exit(0);

  const list = await mapRunList(config);

  log.newLine();

  await runList(config, args, list);
};
