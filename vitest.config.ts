import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // matches the `#/*` path in tsconfig.json, so a test and a script
      // resolve an import the same way
      '#': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    globals: false,
    include: ['test/**/*.test.ts'],
  },
})
