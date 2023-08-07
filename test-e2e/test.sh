#! /bin/bash

for config in ".nodeqarc-prettier.yml"; do for type in "cjs" "esm"; do

  echo
  echo
  echo ">> Testing $type module (with $config)"
  echo
  echo

  cp $config .nodeqarc.yml

  if [[ $type == "cjs" ]]; then
    jq 'del(.type)' package.json > tmp_package.json && mv tmp_package.json package.json
    cat > .prettierrc.js <<EOL
// .prettierrc.js

module.exports = require('@templ/node-qa-configs/prettierrc.js');
EOL
  else
    cat > .prettierrc.js <<EOL
// .prettierrc.js

import prettierrc from '@templ/node-qa-configs/prettierrc.js';

export default prettierrc;
EOL
    jq '. + { "type": "module" }' package.json > tmp_package.json && mv tmp_package.json package.json
  fi

  rm -rf node_modules package-lock.json
  npm i

  node ../src/index.js -vvv

done; done
