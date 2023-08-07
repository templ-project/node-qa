// import {cosmiconfigSync} from 'cosmiconfig';
// import {NodeQaArgs} from './args';
import {supportedModules} from './lib/detect.js';
import * as log from './lib/log.js';
import YAML from 'yaml';
import * as path from 'path';
import * as fs from 'fs';
import enquirer from 'enquirer';

const {prompt} = enquirer;

export const defaultNodeQaConfig = {
  modules: supportedModules,
  ignoreMissingModules: true,
};

const packagesByTag = {
  coffeescript: [],
  javascript: [],
  typescript: [],

  coffeelint: ['@coffeelint/cli'],
  eslint: ({language}) => {
    return [
      'eslint',
      ...(language === 'typescript' ? ['@typescript-eslint/eslint-plugin', '@typescript-eslint/parser'] : []),
      'eslint-config-prettier',
      'eslint-plugin-mocha',
      'eslint-plugin-prettier',
      // 'eslint-plugin-sonar',
      'eslint-plugin-sonarjs',
    ];
  },
  standard: ({language}) => {
    return ['standard', ...(language === 'typescript' ? ['ts-standard'] : [])];
  },

  prettier: ({language}) => {
    return [
      'prettier',

      ...(language === 'coffeescript'
        ? ['import-sort-style-module']
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

const enquireOptions = async () => {
  let answers = await prompt([
    {
      choices: [
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
      ],
      message: 'What language are you using?',
      name: 'language',
      type: 'select',
    },
    {
      message: 'Using prettier?',
      name: 'prettier',
      type: 'confirm',
    },
  ]);

  const lintAnswers = await prompt([
    {
      choices: () => {
        const {language} = answers;
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
      },
      message: 'What linter are you using?',
      name: 'linter',
      type: 'select',
    },
  ]);
  answers = {...answers, ...lintAnswers};

  const qaAnswers = await prompt([
    {
      choices: () => {
        const {language} = answers;
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
      },
      message: 'What qa tools are you using?',
      name: 'qa',
      type: 'multiselect',
    },
    {
      choices: [
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
      ],
      message: 'What security tools are you using?',
      name: 'security',
      type: 'multiselect',
    },
    {
      message: 'Should we provide our default configs?',
      name: 'default-configs',
      type: 'confirm',
    },
  ]);
  answers = {...answers, ...qaAnswers};

  return answers;
};

const composePackagesArray = (options) => {
  const packages = [...(options.prettier ? packagesByTag[options.linter](options) : [])];

  for (const item of [options.linter]) {
    packages.push(...(Array.isArray(packagesByTag[item]) ? packagesByTag[item] : packagesByTag[item](options)));
  }

  for (const item of options.qa) {
    packages.push(...(Array.isArray(packagesByTag[item]) ? packagesByTag[item] : packagesByTag[item](options)));
  }

  for (const item of options.security) {
    packages.push(...(Array.isArray(packagesByTag[item]) ? packagesByTag[item] : packagesByTag[item](options)));
  }

  return packages;
};

const writeConfig = async (options) => {
  log.info('Writing config file...');
  const config = defaultNodeQaConfig;

  config.modules = [
    ...[...(options.prettier ? ['prettier'] : []), options.linter, ...options.qa, ...options.security].map((name) =>
      config.modules.find((m) => m.name === name),
    ),
  ];

  fs.writeFileSync(path.join(process.cwd(), '.node-qa.yaml'), YAML.stringify(config, null, 2));

  log.info('done.');
};

export const configure = async (args) => {
  const options = await enquireOptions();
  const packages = composePackagesArray(options);

  await writeConfig(options);

  log.info([
    `Please make sure you run one of these commands in order to install the packages:`,
    '',
    `npm i -D ${packages.join(' ')}`,
    'or',
    `yarn add --dev ${packages.join(' ')}`,
  ]);
};
