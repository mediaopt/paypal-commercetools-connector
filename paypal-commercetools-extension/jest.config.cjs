module.exports = {
  displayName: 'Tests Typescript Application - paypal-commercetools-extension',
  setupFiles: ['<rootDir>/tests/setup-tests.ts'],
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/tests/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['<rootDir>/tests/setup-tests.ts', 'constants.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/{!(paypal),}/*'],
};
