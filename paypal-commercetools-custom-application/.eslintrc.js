process.env.ENABLE_NEW_JSX_TRANSFORM = 'true';

/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: ['@commercetools-frontend/eslint-config-mc-app'],
  plugins: ['@graphql-eslint'],
  overrides: [
    {
      files: ['**/*.ctp.graphql'],
      parser: '@graphql-eslint/eslint-plugin',
      plugins: ['@graphql-eslint'],
      rules: {
        '@graphql-eslint/known-type-names': 'error',
      },
    },
  ],
};
