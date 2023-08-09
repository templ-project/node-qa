/**
 * Writen with the help of this article:
 *
 * @link https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html
 * @link https://github.com/sensedeep/dynamodb-onetable/blob/main/package.json
 */

import {args} from './args.js';
import {run} from './runner.js';
import {configure} from './config.js';

if (args?.configure) {
  configure(args);
} else {
  run(args);
}
