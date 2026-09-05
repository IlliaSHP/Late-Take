import { defineConfig } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
  {
    files: ['apps/extension/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.webextensions,
    },
  },
])