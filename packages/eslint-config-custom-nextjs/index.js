module.exports = {
  extends: ['eslint:recommended', 'plugin:node/recommended', 'next/core-web-vitals', 'turbo', 'prettier'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'block-scoped-var': 'error',
    'eol-last': 'error',
    eqeqeq: 'error',
    'no-restricted-properties': [
      'error',
      {
        object: 'describe',
        property: 'only',
      },
      {
        object: 'it',
        property: 'only',
      },
    ],
    'no-trailing-spaces': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    quotes: ['warn', 'single', {avoidEscape: true}],
    'react-hooks/exhaustive-deps': 'off',
    'react/jsx-curly-brace-presence': [
      'error',
      {
        props: 'never',
        children: 'never',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-warning-comments': 'off',
        '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/restrict-template-expressions': [
          'error',
          {
            allowBoolean: false,
            allowNullish: false,
            allowAny: true,
            allowRegExp: false,
            allowNever: false,
          },
        ],
        '@typescript-eslint/no-base-to-string': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports',
            disallowTypeAnnotations: true,
          },
        ],
        'node/no-extraneous-import': [
          'error',
          {
            allowModules: ['msw', 'vitest', '@storybook/preview-api', '@sentry/types', '@playwright/test'],
          },
        ],
        'node/no-missing-import': 'off',
        'node/no-empty-function': 'off',
        'node/no-unpublished-import': 'off',
        'node/no-unpublished-require': 'off',
        'node/no-unsupported-features/es-syntax': 'off',
        'node/no-missing-require': 'off',
        'node/shebang': 'off',
        'no-dupe-class-members': 'off',
        'require-atomic-updates': 'off',
      },
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
  ],
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
}
