import js from '@eslint/js'
import gitignore from 'eslint-config-flat-gitignore'
import { common, playwrightRecommended } from './eslint.shared.mjs'
import tseslint from 'typescript-eslint'

export default [
  // reuse patterns in .gitignore via community plugin
  gitignore(),
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mts', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'warn',
    },
  },
  { ...playwrightRecommended, files: ['**/tests/**/*.spec.ts', '**/tests/**/*.test.ts'] },
  // shared rules/plugins/configs
  ...common,
  // shared json / prettier / filename-case / augmentations brought in above via ...common
  // Parse .mts and .mjs using the TypeScript ESLint parser so ESM TS config files parse
  {
    files: ['**/*.mts', '**/*.mjs'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  // CLI app runs on Node (Ink) and needs some globals like process/fetch/setTimeout
  {
    files: ['apps/cli/**'],
    languageOptions: {
      globals: {
        process: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
  },
  // Shared package uses Node/Bun globals
  {
    files: ['packages/shared/**'],
    languageOptions: {
      globals: {
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Buffer: 'readonly',
        Bun: 'readonly',
        console: 'readonly',
      },
    },
  },
  // prettier included via shared common
]
