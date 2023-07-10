import {cosmiconfigSync} from 'cosmiconfig';

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

export const config: NodeQaConfig = (cosmiconfigSync('nodeqa').search()?.config || {}) as NodeQaConfig;