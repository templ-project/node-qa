const {writeFileSync} = require('fs');
const {join: pathJoin} = require('path');
const globby = require('globby');

// Write package.json files
writeFileSync(
  pathJoin('dist', 'cjs', 'package.json'),
  JSON.stringify({
    type: 'commonjs',
  }, null, 2)
);

writeFileSync(
  pathJoin('dist', 'mjs', 'package.json'),
  JSON.stringify({
    type: 'module',
  }, null, 2)
);

// Copy .d.ts files
const copyDeclarationFiles = async (sourceDir, targetDir) => {
  const declarationFiles = await globby(pathJoin(sourceDir, '**/*.d.ts'));

  for (const file of declarationFiles) {
    const targetPath = pathJoin(targetDir, path.relative(sourceDir, file));
    fs.copyFileSync(file, targetPath);
  }
};

(async () => {
  await copyDeclarationFiles('src', 'dist/mjs');
  await copyDeclarationFiles('src', 'dist/cjs');
})();