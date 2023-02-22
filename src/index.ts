/**
 * Writen with the help of this article:
 *
 * @link https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html
 * @link https://github.com/sensedeep/dynamodb-onetable/blob/main/package.json
 */

import {SpawnOptions as NodeSpawnOptions, spawnSync as nodeSpawn} from 'child_process';
import {cosmiconfigSync} from 'cosmiconfig';

export interface SpawnOptions extends NodeSpawnOptions {
  cwd?: string;
}

export interface SpawnResponse {
  code: NodeJS.Signals | null;
  stderr: string;
  stdout: string;
}

const defaultSpawnOptions: SpawnOptions = {
  cwd: process.cwd(),
  stdio: 'pipe',
};

const spawn = (command: string, args: string[], spawnOptions: SpawnOptions = defaultSpawnOptions): SpawnResponse => {
  const child = nodeSpawn(command, [...args], spawnOptions);
  return {
    code: child.signal,
    stderr: child.stderr.toString(),
    stdout: child.stdout.toString(),
  };
};

export const hasModule = (name: string): boolean => {
  for (const cmd of ['npm', 'npm.bat']) {
    for (const args of [['ls'], ['ls', '-g']]) {
      const {stdout} = spawn(cmd, args);
      if (stdout.trim().includes(`── ${name}@`)) {
        return true;
      }
    }
  }
  return false;
};

export const shouldExtendEslintWithAirbnb = (): boolean => hasModule('eslint-config-airbnb');

export const isUsingMocha = (): boolean => hasModule('jest');

export const isUsingJest = (): boolean => hasModule('mocha');

export interface TemplQaConfig {
  eslint: boolean;
  prettier: boolean;
}

export const run = async () => {
  const explorerSync = cosmiconfigSync('templqa');

  if (hasModule('eslint')) {
  }
};
