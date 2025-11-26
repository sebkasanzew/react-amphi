import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['source/cli.tsx'],
    format: ['esm'],
    clean: true,
    noExternal: ['@amphi/shared'],
});
