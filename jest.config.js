// jest.config.js

module.exports = {
    clearMocks: true,
    coverageDirectory: 'coverage',
    moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'],
    // rootDir: '.',
    roots: ['test'],
    testEnvironment: 'node',
    transform: {'^.+\\.(t|j)s$': 'ts-jest'},
  };