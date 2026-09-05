import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import ts from 'typescript-eslint'

import extensionConfig from './eslint/extension.mjs'
import mobileConfig from './eslint/mobile.mjs'

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.expo/**',
      '**/.next/**',
      '**/android/**',
      '**/ios/**',
      '**/.git/**',
      '**/.idea/**',
      '**/.vscode/**',
      '**/.DS_Store',
      '**/expo-env.d.ts',
    ],
  },
  // ===== COMMON: all TypeScript monorepo =====
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ts.configs.recommended,
    ],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      eqeqeq: 'warn',
      curly: ['warn', 'multi-line'],
      'no-else-return': 'warn',
    },
  },
  
  // ===== PROJECT-SPECIFIC =====
  ...mobileConfig,
  ...extensionConfig,
  
  // ===== WEB + EXTENSION =====
  {
    files: ['apps/{web,extension}/**/*.{ts,tsx}'],
    extends: [
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'jsx-a11y/media-has-caption': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': 'warn',
    },
  },

  // ===== COMMON REACT =====
  {
    files: ['apps/{mobile,web,extension}/**/*.{ts,tsx}'],
    rules: {
      'react/prop-types': 'off',
      'react/display-name': 'warn',
      'react/no-unescaped-entities': 'off',
      'react/jsx-props-no-spreading': 'off',
    },
  },
])