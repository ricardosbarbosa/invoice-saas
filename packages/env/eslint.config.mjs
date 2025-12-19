import { config as baseConfig } from "@workspace/eslint-config/base"

export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        // Minimal Node globals for this package (avoids requiring the `globals` dependency at runtime)
        process: "readonly",
        Buffer: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        exports: "readonly",
        require: "readonly",
      },
    },
  },
]


