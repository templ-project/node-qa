/**
 * Writen with the help of this article:
 *
 * @link https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html
 * @link https://github.com/sensedeep/dynamodb-onetable/blob/main/package.json
 */

import {cosmiconfigSync} from 'cosmiconfig';

import { hasModule, findModuleBinary, spawn, defaultSpawnOptionsWithOutput } from '_run';

export const shouldExtendEslintWithAirbnb = (): boolean => hasModule('eslint-config-airbnb');

export const isUsingMocha = (): boolean => hasModule('jest');

export const isUsingJest = (): boolean => hasModule('mocha');

export interface NodeQaConfig {
  order: string[]
  // https://www.npmjs.com/package/dependency-cruiser
  dependencyCruiser?: boolean;
  dependencyCruiserArgs?: string[];
  // https://www.npmjs.com/package/setup-cpp || https://www.npmjs.com/package/setup-cpp
  clangFormat?: boolean;
  clangFormatArgs?: string[];
  clangTidy?: boolean;
  clangTidyArgs?: string[];
  // https://www.npmjs.com/package/eslint
  eslint?: boolean;
  eslintArgs?: string[];
  // https://www.npmjs.com/package/jscpd
  jscpd?: boolean;
  jscpdArgs?: string[];
  // https://www.npmjs.com/package/license-checker
  licenseChecker?: boolean;
  licenseCheckerArgs?: string[];
  // https://www.npmjs.com/package/prettier
  prettier?: boolean;
  prettierArgs?: string[];
  // https://www.npmjs.com/package/snyk
  snyk?: boolean;
  snykArgs?: string[];
  // https://www.npmjs.com/package/sonarqube-scanner
  sonarQube?: boolean;
  sonarQubeArgs?: string[];
}

export const run = async () => {
  const config: NodeQaConfig = (cosmiconfigSync('nodeqa').search()?.config || {}) as NodeQaConfig;

  if (config?.eslint && hasModule('eslint')) {
    const eslint = findModuleBinary('eslint');
    if (eslint !== null) {
      const {code} = spawn(eslint, config?.eslintArgs || [], defaultSpawnOptionsWithOutput)
      if (code !== 0) {
        process.exit(code || 254);
      }
    }
  }
};
