import playwright from 'eslint-plugin-playwright'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import eslintPluginJsonc from 'eslint-plugin-jsonc'
import unicorn from 'eslint-plugin-unicorn'
import turboPlugin from 'eslint-plugin-turbo'

// Shared/common pieces used across flat ESLint configs in this repo.
export const playwrightRecommended = playwright.configs['flat/recommended']

export const common = [
  // Turborepo checks (turbo.json etc.)
  turboPlugin.configs['flat/recommended'],

  // Unicorn rules used repo-wide
  unicorn.configs['recommended'],
  // Allow null in some places — repository preference
  { rules: { 'unicorn/no-null': 'off' } },

  // Filename casing conventions used across the monorepo
  {
    files: ['**/components/**/*.{ts,tsx,js,jsx,mjs,mts}'],
    rules: {
      'unicorn/filename-case': ['error', { cases: { pascalCase: true } }],
    },
  },
  {
    files: ['**/hooks/**/*.{ts,tsx,js,mjs,mts}'],
    rules: {
      'unicorn/filename-case': ['error', { cases: { camelCase: true } }],
    },
  },
  {
    files: ['**/providers/**/*.{ts,tsx,js,jsx,mjs,mts}'],
    rules: {
      'unicorn/filename-case': ['error', { cases: { pascalCase: true } }],
    },
  },

  // JSON/JSONC formatting rules and Prettier integration
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  ...eslintPluginJsonc.configs['flat/prettier'],
  prettierRecommended,
]

export default common
