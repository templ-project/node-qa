import {spawn as nodeSpawn, spawnSync as nodeSpawnSync, SpawnOptions as NodeSpawnOptions} from 'child_process';

import {platform} from 'os';

export interface SpawnOptions extends NodeSpawnOptions {
  cwd?: string;
}

export const defaultSpawnOptions: SpawnOptions = {
  cwd: process.cwd(),
  stdio: 'pipe',
};

export interface SpawnResponse {
  code: number | null;
  stderr: string;
  stdout: string;
}

export const defaultSpawnOptionsWithOutput: SpawnOptions = {
  ...defaultSpawnOptions,
  stdio: ['inherit', 'inherit', 'inherit'],
};

export const spawnSync = (command: string, args: string[], spawnOptions = defaultSpawnOptions): SpawnResponse => {
  const child = nodeSpawnSync(command, [...args], spawnOptions);

  if (defaultSpawnOptions.stdio !== 'pipe') {
    return {
      code: child.status,
      stderr: '',
      stdout: '',
    };
  }

  return {
    code: child.status,
    stderr: (child.stderr || '').toString(),
    stdout: (child.stdout || '').toString(),
  };
};

export const spawnAsync = async (
  command: string,
  args: string[],
  spawnOptions = defaultSpawnOptions,
): Promise<SpawnResponse> => {
  return new Promise((resolve, reject) => {
    const child = nodeSpawn(command, args, spawnOptions);
    let stdout = '';
    let stderr = '';

    if (spawnOptions.stdio === 'pipe' && child.stdout) {
      child.stdout.on('data', (data) => (stdout += data));
    }

    if (spawnOptions.stdio === 'pipe' && child.stderr) {
      child.stderr.on('data', (data) => (stderr += data));
    }

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      resolve({code, stderr, stdout});
    });
  });
};

export const spawn = (
  command: string,
  args: string[],
  spawnOptions = defaultSpawnOptions,
  useAsync = false,
  // eslint-disable-next-line max-params
): SpawnResponse | Promise<SpawnResponse> => {
  return useAsync ? spawnAsync(command, args, spawnOptions) : spawnSync(command, args, spawnOptions);
};

export const which = (name: string): string | null => {
  let result;
  if (platform() === 'win32') {
    result = spawn('powershell', ['-Command', `(Get-Command ${name}).Source`]);
  } else {
    result = spawn('which', [name]);
  }
  const {code, stdout} = result as SpawnResponse;
  if (code === 0) {
    return stdout.trim();
  }
  return null;
};
