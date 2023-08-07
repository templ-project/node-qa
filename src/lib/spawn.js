import {spawn as nodeSpawn, spawnSync as nodeSpawnSync} from 'child_process';

import {platform} from 'os';

export const defaultSpawnOptions = {
  cwd: process.cwd(),
  stdio: 'pipe',
};

export const defaultSpawnOptionsWithOutput = {
  ...defaultSpawnOptions,
  stdio: ['inherit', 'inherit', 'inherit'],
};

export const spawnSync = (command, args, spawnOptions = defaultSpawnOptions) => {
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

export const spawnAsync = async (command, args, spawnOptions = defaultSpawnOptions) => {
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

export const spawn = (command, args, spawnOptions = defaultSpawnOptions, useAsync = false) => {
  return useAsync ? spawnAsync(command, args, spawnOptions) : spawnSync(command, args, spawnOptions);
};

export const which = (name) => {
  let result;
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
