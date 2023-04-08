import {platform} from 'os';

import {which} from '../src/_run';

describe('which', function () {
  it('which("npm") to return npm correct path', function () {
    const command = which(`npm${platform() === 'win32'?'.cmd':''}`)
    console.log([command])
    expect(command).toMatch(/nodejs[\/\\]npm(.cmd)?/);
  });
});

// test('which("npm") to return npm correct path', function () {
//   expect(which(`npm${platform() === 'win32' ? '.cmd' : ''}`)).toMatch(/nodejs[//\/]npm(.cmd)?/);
// });
