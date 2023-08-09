#! /bin/bash

find ./dist/configs/cjs -iname "*.js" -maxdepth 1 | while read f; do

  echo "Fixing $f"

  if [[ "$(uname)" == "Darwin" ]]; then
    # macOS
    sed -i '' 's/exports.default/module.exports/' "$f"
  else
    # Linux
    sed -i 's/exports.default/module.exports/' "$f"
  fi

done
