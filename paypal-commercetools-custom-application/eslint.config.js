process.env.ENABLE_NEW_JSX_TRANSFORM = 'true';

const graphqlPlugin = require('@graphql-eslint/eslint-plugin');
const mcAppConfig = require('@commercetools-frontend/eslint-config-mc-app');

module.exports = [
  {
    ignores: [
      '.cache/',
      'build/',
      'dist/',
      'public/',
      'coverage/',
      'generated/',
    ],
  },
  ...mcAppConfig,
  {
    files: ['**/*.ctp.graphql'],
    plugins: { '@graphql-eslint': graphqlPlugin },
    languageOptions: {
      parser: graphqlPlugin,
      parserOptions: { graphQLConfig: { schema: './schemas/ctp.json' } },
    },
    rules: {
      '@graphql-eslint/known-type-names': 'error',
    },
  },
  {
    files: ['setup.js'],
    languageOptions: { globals: { jest: 'readonly' } },
  },
  {
    files: ['eslint.config.js'],
    rules: { 'import/extensions': 'off' },
  },
];
