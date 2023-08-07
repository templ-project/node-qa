import {join as pathJoin, dirname} from 'path';
import {spawn, which} from './spawn.js';

import {platform} from 'os';
import {existsSync} from 'fs';

export const supportedModules = [
  {name: 'prettier', args: ['--write', './{src,test}/**/*.{js,ts}']},
  {name: 'eslint', args: ['./{src,test}/**/*.{js,ts}', '--fix']},
  {name: 'standard', args: ['src/**/*.js', '--fix']},
  {
    name: 'dependency-cruiser',
    binary: 'depcruise',
    args: ['--config', '.dependency-cruiser.js', 'src', '-x', 'src/*.d.js'],
  },
  {name: 'jscpd', args: ['./src', '--blame']},
  {
    name: 'license-checker',
    args: [
      '--production',
      '--json',
      "--failOn='AGPL AGPL 1.0; AGPL 3.0; CDDL or GPLv2 with exceptions; CNRI Python GPL Compatible; Eclipse 1.0; Eclipse 2.0; GPL; GPL 1.0; GPL 2.0; GPL 2.0 Autoconf; GPL 2.0 Bison; GPL 2.0 Classpath; GPL 2.0 Font; GPL 2.0 GCC; GPL 3.0; GPL 3.0 Autoconf; GPL 3.0 GCC; GPLv2 with XebiaLabs FLOSS License Exception; LGPL; LGPL 2.0; LGPL 2.1; LGPL 3.0; Suspected Eclipse 1.0; Suspected Eclipse 2.0'",
    ],
  },
  {name: 'snyk', args: ['test', '--severity-threshold=high']},
  {name: 'sonarqube-scanner', binary: 'sonar-scanner'},
];

export const osExtensions = () => (platform() === 'win32' ? ['.cmd', '.bat', '.ps1'] : ['', '.sh']);

export const hasModule = (name) => {
  const npm = findGlobalModuleBinary('npm', osExtensions());
  if (typeof npm === 'string') {
    for (const args of [['ls'], ['ls', '-g']]) {
      const {stdout} = spawn(npm, args);
      if (stdout.trim().includes(`── ${name}@`)) {
        return {found: true, type: 'local'};
      } else {
        const {stdout} = spawn(npm, args, {cwd: '/'});
        if (stdout.trim().includes(`── ${name}@`)) {
          return {found: true, type: 'global'};
        }
      }
    }
  }
  return {found: false};
};

export const findGlobalModuleBinary = (name, extensions) => {
  for (const ext of extensions) {
    const filePath = which(`${name}${ext}`);
    if (filePath !== null) {
      return filePath;
    }
  }
  return null;
};

export const findLocalModuleBinary = (name, extensions) => {
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

export const findModuleBinary = (name) => {
  const globalBinary = findGlobalModuleBinary(name, osExtensions());
  if (globalBinary !== null) {
    return globalBinary;
  }

  return findLocalModuleBinary(name, osExtensions());
};
