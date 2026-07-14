module.exports = {
  displayName: 'Tests Typescript Application - paypal-commercetools-extension',
  setupFiles: ['<rootDir>/tests/setup-tests.ts'],
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/{!(paypal),}/*'],
  coverageProvider: 'v8',
};
