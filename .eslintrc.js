// .babelrc.js

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    mocha: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:sonar/recommended",
    "plugin:sonarjs/recommended",
    "plugin:jest/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "prettier", "sonar", "sonarjs"],
  root: true,
  rules: {
    "@typescript-eslint/object-curly-spacing": "off",
    "@typescript-eslint/space-infix-ops": "off",
    "consistent-return": 2,
    "import/no-extraneous-dependencies": "off",
    "import/prefer-default-export": "off",
    "max-len": ["error", 120],
    "max-lines-per-function": ["warn", 40],
    "max-params": ["error", 3],
    "no-else-return": 1,
    "sonar/no-invalid-await": 0,
    "space-unary-ops": 2,
    curly: ["error", "all"],
    indent: [1, 2],
    semi: [1, "always"],
  },
};
