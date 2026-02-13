import gitignore from 'eslint-config-flat-gitignore'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { fixupConfigRules } from '@eslint/compat'
import { defineConfig } from 'eslint/config'
import { common, playwrightRecommended } from '../../eslint.shared.mjs'

const eslintConfig = defineConfig([
  // reuse patterns in repo .gitignore (and subproject .gitignore if present)
  // NOTE: `gitignore()` looks at the project-level .gitignore (the nearest one),
  // so in monorepo setups you may need to add common ignore patterns here as
  // well (e.g. `test-results`) when running ESLint from this package.
  gitignore(),
  ...fixupConfigRules(nextVitals),
  ...fixupConfigRules(nextTs),
  { ...playwrightRecommended, files: ['tests/**/*.spec.ts', 'tests/**/*.test.ts'] },
  // shared rules/plugins/configs
  ...common,

  // filename-case / hook / provider rules are provided by ...common above
  // Allow next.config.js to remain CommonJS without prefer-module errors
  {
    files: ['next.config.js'],
    rules: {
      'unicorn/prefer-module': 'off',
    },
  },
])

export default eslintConfig
