import {Module, findLocalModuleBinary, osExtensions, supportedModules} from './lib/detect.js';
import * as log from './lib/log.js';
import YAML from 'yaml';
import * as path from 'path';
import * as fs from 'fs';
import enquirer from 'enquirer';
import {NodeQaArgs, VerboseLevelPrintFailingScriptsOutput} from './args.js';
import {defaultSpawnOptionsWithOutput, which, spawn} from './lib/spawn.js';

const {prompt} = enquirer;
export type PackagesByTagFunction = ({language}: {language: string}) => string[];

export type PackagesByTag = {
  coffeescript: string[];
  javascript: string[];
  typescript: string[];

  coffeelint: string[];
  eslint: PackagesByTagFunction;
  standard: PackagesByTagFunction;

  prettier: PackagesByTagFunction;

  // eslint-disable-next-line sonarjs/no-duplicate-string
  'dependency-cruiser': string[];
  jscpd: string[];
  // eslint-disable-next-line sonarjs/no-duplicate-string
  'license-checker': string[];

  snyk: string[];
  // eslint-disable-next-line sonarjs/no-duplicate-string
  'sonarqube-scanner': string[];
  'npm-audit': string[];
};

export type PackagesByTagKey = keyof PackagesByTag;

export type NodeQaConfig = {
  modules?: Module[];
  ignoreMissingModules?: boolean;
};

export type NodeQaConfigureOptions = {
  language: PackagesByTagKey;
  prettier: boolean;
  linter: PackagesByTagKey;
  qa: PackagesByTagKey[];
  security: PackagesByTagKey[];
  shouldInstallDependencies: boolean;
  shouldConfigureDependencies: boolean;
};

export const defaultNodeQaConfig: NodeQaConfig = {
  modules: supportedModules,
  ignoreMissingModules: true,
};

const packagesByTag: PackagesByTag = {
  coffeescript: [],
  javascript: [],
  typescript: [],

  coffeelint: ['@coffeelint/cli'],
  eslint: ({language}: {language: string}): string[] => {
    return [
      'eslint',
      ...(language === 'typescript' ? ['@typescript-eslint/eslint-plugin', '@typescript-eslint/parser'] : []),
      ...(language === 'javascript'
        ? ['@babel/core', '@babel/eslint-parser', '@babel/preset-env', '@babel/register']
        : []),
      'eslint-config-prettier',
      'eslint-plugin-mocha',
      'eslint-plugin-prettier',
      // 'eslint-plugin-sonar',
      'eslint-plugin-sonarjs',
    ];
  },
  standard: ({language}: {language: string}) => {
    return ['standard', ...(language === 'typescript' ? ['ts-standard'] : [])];
  },

  prettier: ({language}: {language: string}) => {
    return [
      'prettier',

      ...(language === 'coffeescript'
        ? ['prettier-plugin-coffeescript']
        : ['prettier-plugin-import-sort', 'import-sort-style-module']),
    ];
  },

  'dependency-cruiser': ['dependency-cruiser'],
  jscpd: ['jscpd', '@jscpd/badge-reporter'],
  'license-checker': ['license-checker'],

  snyk: ['snyk'],
  'sonarqube-scanner': ['sonarqube-scanner'],
  'npm-audit': [],
};

const composePackagesArray = (options: NodeQaConfigureOptions): string[] => {
  let packages: string[] = [];

  for (const item of [
    ...((options.prettier ? ['prettier'] : []) as PackagesByTagKey[]),
    options.linter,
    ...options.qa,
    ...options.security,
  ] as PackagesByTagKey[]) {
    const newPackages: string[] = Array.isArray(packagesByTag[item])
      ? (packagesByTag[item] as string[])
      : (packagesByTag[item] as PackagesByTagFunction)(options);
    packages = [...packages, ...newPackages];
  }

  return packages;
};

const languageChoices = [
  {
    message: 'TypeScript',
    name: 'typescript',
  },
  {
    message: 'JavaScript',
    name: 'javascript',
  },
  {
    message: 'CoffeeScript',
    name: 'coffeescript',
  },
];

const lintChoicesFilter = ({language}: {language: string; [key: string]: unknown}) => {
  let choices = [
    {
      message: 'CoffeeLint',
      name: 'coffeelint',
    },
    {
      message: 'ESLint',
      name: 'eslint',
    },
    {
      message: 'StandardJs',
      name: 'standard',
    },
  ];

  if (language === 'coffeescript') {
    choices = choices.filter(({name}) => name !== 'standard' && name !== 'eslint');
  } else {
    choices = choices.filter(({name}) => name !== 'coffeelint');
  }

  return choices;
};

const qaChoicesFilter = ({language}: {language: string; [key: string]: unknown}) => {
  let choices = [
    {
      message: 'Dependency Cruiser',
      name: 'dependency-cruiser',
    },
    {
      message: 'JSCPD',
      name: 'jscpd',
    },
    {
      message: 'License Checker',
      name: 'license-checker',
    },
  ];

  if (language === 'coffeescript') {
    choices = choices.filter(({name}) => name !== 'dependency-cruiser');
  }

  return choices;
};

const securityChoices = [
  {
    message: 'Snyk',
    name: 'snyk',
  },
  {
    message: 'Sonar Qube',
    name: 'sonarqube-scanner',
  },
  {
    message: 'Npm Audit',
    name: 'npm-audit',
  },
];

const enquireOptions = async (): Promise<NodeQaConfigureOptions> => {
  let answers: NodeQaConfigureOptions = await prompt([
    {
      choices: languageChoices,
      message: 'What language are you using?',
      name: 'language',
      type: 'select',
    },
    {
      initial: true,
      message: 'Using prettier?',
      name: 'prettier',
      type: 'confirm',
    },
  ]);

  const lintAnswers: Partial<NodeQaConfigureOptions> = await prompt([
    {
      choices: lintChoicesFilter(answers),
      message: 'What linter are you using?',
      name: 'linter',
      type: 'select',
    },
  ]);
  answers = {...answers, ...lintAnswers};

  const qaAnswers: Partial<NodeQaConfigureOptions> = await prompt([
    {
      choices: qaChoicesFilter(answers),
      message: 'What qa tools are you using?',
      name: 'qa',
      type: 'multiselect',
    },
    {
      choices: securityChoices,
      message: 'What security tools are you using?',
      name: 'security',
      type: 'multiselect',
    },
    // {
    //   message: 'Should we provide our default configs?',
    //   name: 'default-configs',
    //   type: 'confirm',
    // },
  ]);
  answers = {...answers, ...qaAnswers};

  const packages = composePackagesArray(answers);
  const finalQuestions: Partial<NodeQaConfigureOptions> = await prompt([
    {
      initial: true,
      message: `Should we install dependencies (${packages.join(', ')}) for you?`,
      name: 'shouldInstallDependencies',
      type: 'confirm',
    },
    {
      message: `Should we trigger dependencies configuration for you?`,
      name: 'shouldConfigureDependencies',
      type: 'confirm',
    },
  ]);
  answers = {...answers, ...finalQuestions};

  return answers;
};

const buildConfig = (options: NodeQaConfigureOptions): NodeQaConfig => {
  const config = defaultNodeQaConfig;

  config.modules = [
    ...[...(options.prettier ? ['prettier'] : []), options.linter, ...options.qa, ...options.security].map(
      (name) => config.modules?.find((m) => m.name === name) as Module,
    ),
  ];

  return config;
};

const writeConfig = async (config: NodeQaConfig): Promise<void> => {
  log.info('Writing config file...');

  fs.writeFileSync(path.join(process.cwd(), '.nodeqarc.yml'), YAML.stringify(config, null, 2));

  log.info('done.');
  log.newLine();
};

const installDependencies = async (args: NodeQaArgs, options: NodeQaConfigureOptions): Promise<void> => {
  if (options.shouldInstallDependencies) {
    log.info('Installing dependencies...');

    const packages = composePackagesArray(options);
    const npm = which('npm');

    if (args.verbose || 0 > VerboseLevelPrintFailingScriptsOutput) {
      log.info(`Running ${npm} i -D ${packages.join(' ')}`);
    }
    await spawn(npm as string, ['i', '-D', ...packages], defaultSpawnOptionsWithOutput, true);

    log.info('done.');
    log.newLine();
  }
};

const configureDependencies = async (
  args: NodeQaArgs,
  options: NodeQaConfigureOptions,
  modules: Module[],
): Promise<void> => {
  if (options.shouldConfigureDependencies) {
    log.info(`Configuring dependencies (${modules.map((m) => m.name).join(', ')})...`);

    for (const m of modules) {
      const binary = findLocalModuleBinary(m.name, osExtensions());
      if (m.configArgs && binary) {
        log.info(`Configuring ${m.name}...`);

        if (args.verbose || 0 > VerboseLevelPrintFailingScriptsOutput) {
          log.info(`Running ${binary} ${m.configArgs.join(' ')}`);
        }

        await spawn(binary as string, m.configArgs, defaultSpawnOptionsWithOutput);

        log.info('done');
      }
    }

    log.info('done');
    log.newLine();
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const configure = async (args: NodeQaArgs): Promise<void> => {
  const options = await enquireOptions();

  if ((args.verbose as number) > VerboseLevelPrintFailingScriptsOutput) {
    log.info(`Calling configure with ${JSON.stringify(options)}`);
  }

  const config = buildConfig(options);
  const modules: Module[] = [];
  for (const m of config.modules || []) {
    const mm = {...m};
    delete m.configArgs;
    modules.push(mm);
  }

  await writeConfig(config);

  await installDependencies(args, options);
  await configureDependencies(args, options, modules);
};
