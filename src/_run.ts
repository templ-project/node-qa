import {SpawnOptions as NodeSpawnOptions, spawnSync as nodeSpawn} from 'child_process';

import {join as pathJoin, dirname} from 'path';

import {platform} from 'os';

import {existsSync} from 'fs';

export interface SpawnOptions extends NodeSpawnOptions {
  cwd?: string;
}

export interface SpawnResponse {
  code: number | null;
  stderr: string;
  stdout: string;
}

export const defaultSpawnOptions: SpawnOptions = {
  cwd: process.cwd(),
  stdio: 'pipe',
};

export const defaultSpawnOptionsWithOutput: SpawnOptions = {
  ...defaultSpawnOptions,
  stdio: 'inherit',
};

export const spawn = (command: string, args: string[], spawnOptions: SpawnOptions = defaultSpawnOptions): SpawnResponse => {
  const child = nodeSpawn(command, [...args], spawnOptions);
  return {
    code: child.status,
    stderr: child.stderr.toString(),
    stdout: child.stdout.toString(),
  };
};

export const which = (name: string): string | null => {
  let result: SpawnResponse;
  if (platform() === 'win32') {
    result = spawn('powershell', ['-Command', `(Get-Command ${name}).Source`]);
  } else {
    result = spawn('which', [name]);
  }
  const {code, stdout} = result;
  if (code === 0) {
    return stdout.trim();
  }
  return null;
};

export const osExtensions = (): string[] => platform() === 'win32' ? ['.cmd', '.bat', '.ps1'] : ['', '.sh'];

export const hasModule = (name: string): boolean => {
  const npm = findGlobalModuleBinary('npm', osExtensions());
  if (typeof npm === 'string') {
    for (const args of [['ls'], ['ls', '-g']]) {
      const {stdout} = spawn(npm, args);
      if (stdout.trim().includes(`── ${name}@`)) {
        return true;
      }
    }
  }
  return false;
};

export const findGlobalModuleBinary = (name: string, extensions: string[]): string | null => {
  for (const ext of extensions) {
    const filePath = which(`${name}${ext}`);
    if (filePath !== null) {
      return filePath;
    }
  }
  return null;
};

export const findLocalModuleBinary = (name: string, extensions: string[]): string | null => {
  let cwd = process.cwd();
  let dwd = dirname(cwd);

  do {
    for (const ext of extensions) {
      const filePath = pathJoin(cwd, 'node_modules', '.bin', `${name}${ext}`);
      if (existsSync(filePath)) {
        return filePath;
      }
    }
    cwd = dirname(cwd);
    dwd = dirname(dwd);
  } while (cwd !== dwd);

  return null;
};

export const findModuleBinary = (name: string): string | null => {
  const globalBinary = findGlobalModuleBinary(name, osExtensions());
  if (globalBinary !== null) {
    return globalBinary;
  }

  return findLocalModuleBinary(name, osExtensions());
};
