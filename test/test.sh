#! /bin/bash
set +e

cd .. && npm run build && cd test

find . -iname "${1:-.nodeqarc-*}" | while read config;
# for config in ".nodeqarc-one.yml";
# for config in ".nodeqarc-more.yml";
# for config in ".nodeqarc-none.yml";
# for config in ".nodeqarc-none-failatmissing.yml";
do for type in "cjs" "esm"; do

  echo
  echo
  echo ">> Testing $type module (with $config)"
  echo
  echo

  rm -rf node_modules package-lock.json .babelrc* .eslintrc* .prettierrc*

  cp $config .nodeqarc.yml

  if [[ $type == "cjs" ]]; then
    # jq 'del(.type)' package.json > tmp_package.json && mv tmp_package.json package.json
    jq '. + { "type": "commonjs" }' package.json > tmp_package.json && mv tmp_package.json package.json

    cat > .babelrc.js <<EOL
// .babelrc.js
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [],
};
EOL

    cat > .eslintrc.js <<EOL
// .eslintrc.js

module.exports = require('@templ/node-qa/configs/eslintrc-js.js');
EOL

    cat > .prettierrc.js <<EOL
// .prettierrc.js

module.exports = require('@templ/node-qa/configs/prettierrc.js');
EOL
  else
    jq '. + { "type": "module" }' package.json > tmp_package.json && mv tmp_package.json package.json

    cat > .babelrc.cjs <<EOL
// .babelrc.cjs
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [],
};
EOL

    # eslint does not... support esm config file
    cat > .eslintrc.cjs <<EOL
// .eslintrc.cjs

module.exports = require('@templ/node-qa/configs/eslintrc-js.js');
EOL

    cat > .prettierrc.js <<EOL
// .prettierrc.js

import prettierrc from '@templ/node-qa/configs/prettierrc.js';

export default prettierrc;
EOL
  fi

  npm i

  # ../node_modules/.bin/ts-node-esm ../src/index.ts -vvv
  node ../dist/index.js -vvv
  exitCode=$?

  tested=0
  if [[ "$(yq .ignoreMissingModules .nodeqarc.yml)" == "false" && $config == *"failatmissing"* ]]; then
    if [[ $exitCode -ne 2 ]]; then
      echo "ERROR: Failed at missing modules";
      exit $exitCode
    fi
    tested=1
  fi

  if [[ $tested -eq 0 ]]; then
    if [[ $exitCode -ne 0 ]]; then
      echo "ERROR: Failed - see reason above";
      exit $exitCode
    fi
  fi

done; done
