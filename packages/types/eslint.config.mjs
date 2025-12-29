import baseConfig from "@workspace/eslint-config/base.js";

export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
];

