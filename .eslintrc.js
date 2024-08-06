module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "next/core-web-vitals",
    // "turbo",
    "prettier",
    "plugin:@tanstack/eslint-plugin-query/recommended",
  ],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "block-scoped-var": "error",
    "eol-last": "error",
    eqeqeq: "error",
    "no-restricted-properties": [
      "error",
      {
        object: "describe",
        property: "only",
      },
      {
        object: "it",
        property: "only",
      },
    ],
    "no-trailing-spaces": "error",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": [
      "error",
      {
        allowNamedFunctions: true,
      },
    ],
    quotes: ["warn", "single", { avoidEscape: true }],
    "react-hooks/exhaustive-deps": "off",
    "react/jsx-curly-brace-presence": [
      "error",
      {
        props: "never",
        children: "never",
      },
    ],
    "node/no-unpublished-import": [
      "error",
      {
        allowModules: [
          "@testing-library/jest-dom",
          "vitest",
          "vite-tsconfig-paths",
          "@playwright/test",
          "@storybook/react",
          "@storybook/test",
          "@storybook/nextjs",
          "@testing-library/user-event",
          "@testing-library/react",
          "msw",
        ],
      },
    ],
    "node/no-unpublished-require": [
      "error",
      {
        allowModules: ["dotenv"],
      },
    ],
    "@tanstack/query/exhaustive-deps": "off",
    "i18next/no-literal-string": [
      "error",
      {
        markupOnly: true,
        words: {
          exclude: [
            "Open API URL",
            "Open API",
            "Get",
            "Post",
            "Put",
            "Delete",
            ":",
            "Maven\\.ChatWidget\\.open\\(\\)",
            "Maven\\.ChatWidget\\.close\\(\\)",
          ],
        },
      },
    ],
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-warning-comments": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/restrict-template-expressions": [
      "error",
      {
        allowBoolean: false,
        allowNullish: false,
        allowAny: true,
        allowRegExp: false,
        allowNever: false,
      },
    ],
    "@typescript-eslint/no-base-to-string": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
        disallowTypeAnnotations: true,
      },
    ],
    "node/no-extraneous-import": [
      "error",
      {
        allowModules: [
          "msw",
          "vitest",
          "@storybook/preview-api",
          "@sentry/types",
          "@playwright/test",
        ],
      },
    ],
    "node/no-missing-import": "off",
    "node/no-empty-function": "off",
    "node/no-unpublished-import": "off",
    "node/no-unpublished-require": "off",
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-missing-require": "off",
    "node/shebang": "off",
    "no-dupe-class-members": "off",
    "require-atomic-updates": "off",
  },
  plugins: ["@tanstack/query", "testing-library", "i18next"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      extends: ["plugin:@typescript-eslint/recommended"],
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-warning-comments": "off",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "@typescript-eslint/restrict-template-expressions": [
          "error",
          {
            allowBoolean: false,
            allowNullish: false,
            allowAny: true,
            allowRegExp: false,
            allowNever: false,
          },
        ],
        "@typescript-eslint/no-base-to-string": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            prefer: "type-imports",
            fixStyle: "inline-type-imports",
            disallowTypeAnnotations: true,
          },
        ],
        "node/no-extraneous-import": [
          "error",
          {
            allowModules: [
              "msw",
              "vitest",
              "@storybook/preview-api",
              "@sentry/types",
              "@playwright/test",
            ],
          },
        ],
        "node/no-missing-import": "off",
        "node/no-empty-function": "off",
        "node/no-unpublished-import": "off",
        "node/no-unpublished-require": "off",
        "node/no-unsupported-features/es-syntax": "off",
        "node/no-missing-require": "off",
        "node/shebang": "off",
        "no-dupe-class-members": "off",
        "require-atomic-updates": "off",
      },
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        project: ["./tsconfig.json"],
      },
    },
    {
      files: [
        "**/__tests__/**/*.[jt]s?(x)",
        "(?!e2e/)**/?(*.)+(spec|test).[jt]s?(x)",
      ],
      extends: ["plugin:testing-library/react"],
    },
    {
      files: ["./src/app/app/internal/**/*", "./src/rpc/**/*"],
      rules: {
        "i18next/no-literal-string": "off",
      },
    },
  ],
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
};
