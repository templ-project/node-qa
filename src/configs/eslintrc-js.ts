// .eslintrc.js

import {shouldExtendEslintWithAirbnb, isUsingMocha, isUsingJest} from '../lib/configs.js';

export default {
  env: {
    browser: true,
    es6: true,
    node: true,
    mocha: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {ecmaVersion: 2018, sourceType: 'module'},

  // uncomment for eslint rules
  extends: [
    ...(shouldExtendEslintWithAirbnb() ? ['eslint-config-airbnb-base'] : []),
    'plugin:sonar/recommended',
    'plugin:sonarjs/recommended',
    ...(isUsingMocha() ? ['plugin:mocha/recommended'] : []),
    ...(isUsingJest() ? ['plugin:jest/recommended'] : []),
    'prettier',
  ],
  plugins: ['prettier', 'sonar', 'sonarjs'],
  root: true,
  rules: {
    'consistent-return': 2,
    'max-len': ['error', 120],
    'max-lines-per-function': ['error', 20],
    'max-params': ['error', 3],
    'no-else-return': 1,
    'sonar/no-invalid-await': 0,
    'space-unary-ops': 2,
    curly: ['error', 'all'],
    indent: [1, 2],
    semi: [1, 'always'],
  },
};
