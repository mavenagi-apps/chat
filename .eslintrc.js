module.exports = {
  root: true,
  extends: [
    "plugin:@tanstack/eslint-plugin-query/recommended",
  ],
  rules: {
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
    "prefer-arrow-callback": [
      "error",
      {
        allowNamedFunctions: true,
      },
    ],
    "@tanstack/query/exhaustive-deps": "off",
    // TODO(fernando): Enable once all literal strings are removed
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
  },
  plugins: ["@tanstack/query", "testing-library", "i18next"],
  overrides: [
    // Only uses Testing Library lint rules in test files
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
};
