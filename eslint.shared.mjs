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
  {
    ...unicorn.configs['recommended'],
    files: ['**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}'],
  },
  // Allow null, standard JSDoc asterisk prefixes, module wrappers, and single-line block comments
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}'],
    rules: {
      'unicorn/no-null': 'off',
      'unicorn/no-asterisk-prefix-in-documentation-comments': 'off',
      'unicorn/no-top-level-side-effects': 'off',
      'unicorn/single-line-block-comment-style': 'off',
    },
  },

  // Filename casing conventions used across the monorepo
  {
    files: ['**/components/**/*.{ts,tsx,js,jsx,mjs,mts}'],
    rules: {
      'unicorn/filename-case': ['error', { cases: { pascalCase: true }, checkDirectories: false }],
    },
  },
  {
    files: ['**/hooks/**/*.{ts,tsx,js,mjs,mts}'],
    rules: {
      'unicorn/filename-case': ['error', { cases: { camelCase: true }, checkDirectories: false }],
    },
  },
  {
    files: ['**/providers/**/*.{ts,tsx,js,jsx,mjs,mts}'],
    rules: {
      'unicorn/filename-case': ['error', { cases: { pascalCase: true }, checkDirectories: false }],
    },
  },

  // JSON/JSONC formatting rules and Prettier integration
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  ...eslintPluginJsonc.configs['flat/prettier'],
  prettierRecommended,
]

export default common
