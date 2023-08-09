import {platform} from 'os';

import {which, hasModule, findModuleBinary} from '../src/_run';

describe('which', function () {
  it('which("npm") to return npm correct path', function () {
    const command = which(`npm${platform() === 'win32' ? '.cmd' : ''}`);
    expect(command).toMatch(/nodejs[\/\\]npm(.cmd)?/);
  });
});

describe('hasModule', function () {
  it('hasModule("jest") to return npm correct path', function () {
    expect(hasModule('jest')).toEqual(true);
  });
});

describe('findModuleBinary', function () {
  it('findModuleBinary("jest") to return npm correct path', function () {
    expect(findModuleBinary('jest')).toMatch(/node_modules[\\\/].bin[\\\/]jest/);
  });
  it('findModuleBinary("npm") to return npm correct path', function () {
    expect(findModuleBinary('npm')).toMatch(/nodejs[\/\\]npm(.cmd)?/);
  });
});

// test('which("npm") to return npm correct path', function () {
//   expect(which(`npm${platform() === 'win32' ? '.cmd' : ''}`)).toMatch(/nodejs[//\/]npm(.cmd)?/);
// });
