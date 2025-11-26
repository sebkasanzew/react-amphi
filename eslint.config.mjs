import js from '@eslint/js'
import gitignore from 'eslint-config-flat-gitignore'
import { common, playwrightRecommended } from './eslint.shared.mjs'
import tsParser from '@typescript-eslint/parser'

export default [
  // reuse patterns in .gitignore via community plugin
  gitignore(),
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mts', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
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
      parser: tsParser,
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
  // prettier included via shared common
]
