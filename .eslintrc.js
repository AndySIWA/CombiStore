/**
 * Configuration ESLint pour CombiStore (Expo + TypeScript)
 * Étendue : todo le projet (.)
 */
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: [
        'react',
        '@typescript-eslint',
    ],
    rules: {
        'react/react-internal': 'off',
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-unused-vars': 'warn',
        'spaced-comma': 'error',
        'comma-dangle': ['error', 'always-multiline'],
    },
};