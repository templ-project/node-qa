export default {
  bracketSpacing: false,
  overrides: [
    // see other parsers https://prettier.io/docs/en/options.html#parser
    {
      files: '*.(c|m|)js(|x)',
      options: {
        parser: 'babel',
      },
    },
    {
      files: '*.coffee',
    },
    {
      files: '*.json',
      options: {
        parser: 'json',
        singleQuote: false,
      },
    },
    {
      files: '*.json5',
      options: {
        parser: 'json5',
        singleQuote: false,
      },
    },
    {
      files: '*.yaml,*.yml',
      options: {
        parser: 'yaml',
        singleQuote: false,
      },
    },
    {
      files: '*.ts(|x)',
      options: {
        parser: 'typescript',
      },
    },
  ],
  printWidth: 120,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
};
