// @ts-nocheck
import expoConfig from 'eslint-config-expo/flat.js'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['apps/mobile/**/*.{ts,tsx}'],
    extends: [expoConfig],
  },
])