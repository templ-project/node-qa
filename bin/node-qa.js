#!/usr/bin/env node

(async () => {
  const {readFileSync} = await import('fs');
  const {join: pathJoin} = await import('path');

  const packageJson = JSON.parse(readFileSync(pathJoin(process.cwd(), 'package.json')).toString());
  console.log(`Module type: ${packageJson.type}`)
  if (packageJson.type === 'module') {
    const {run} = await import('../dist/mjs/index.js');
    run();
  } else {
    const {run} = require('../dist/cjs');
    run();
  }
})();
