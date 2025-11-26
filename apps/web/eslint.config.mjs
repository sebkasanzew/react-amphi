import { defineConfig, globalIgnores } from 'eslint/config'
import gitignore from 'eslint-config-flat-gitignore'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { common, playwrightRecommended } from '../../eslint.shared.mjs'

const eslintConfig = defineConfig([
  // reuse patterns in repo .gitignore (and subproject .gitignore if present)
  gitignore(),
  ...nextVitals,
  ...nextTs,
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
  // shared json / prettier / filename-case rules included via `...common`

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
