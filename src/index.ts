/**
 * Writen with the help of this article:
 *
 * @link https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html
 * @link https://github.com/sensedeep/dynamodb-onetable/blob/main/package.json
 */

import {args} from './args';
import {config} from './config';

console.log(args)

// import { hasModule, findModuleBinary, spawn, defaultSpawnOptionsWithOutput } from './_run';

// export const shouldExtendEslintWithAirbnb = (): boolean => hasModule('eslint-config-airbnb');

// export const isUsingMocha = (): boolean => hasModule('jest');

// export const isUsingJest = (): boolean => hasModule('mocha');



// export const run = async () => {
//   console.log(config)

//   if (config?.eslint/* && hasModule('eslint')*/) {
//     const eslint = (findModuleBinary('eslint') || '').trim();
//     console.log([eslint])
//     if (eslint) {
//       const {code} = spawn(eslint, config?.eslintArgs || [], defaultSpawnOptionsWithOutput)
//       if (code !== 0) {
//         process.exit(code || 254);
//       }
//     } else {
//       console.error('Could not find eslint')
//     }
//   }
// };
