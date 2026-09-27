/**
 * Configuration ESLint pour CombiStore (Expo + TypeScript)
 * Étendue : tout le projet (.)
 */
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true,
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
    settings: {
        react: {
            version: 'detect',
        },
    },
    ignorePatterns: [
        'dist/',
        'studio/dist/',
        '.expo/',
        'node_modules/',
    ],
    rules: {
        'react/react-internal': 'off',
        // Expo utilise le JSX runtime automatique : plus besoin d'import React
        'react/react-in-jsx-scope': 'off',
        // Texte d'interface français : apostrophes et guillemets naturels
        'react/no-unescaped-entities': 'off',
        // TypeScript fournit déjà la validation des props
        'react/prop-types': 'off',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        // Désactivée au profit de @typescript-eslint/no-unused-vars
        'no-unused-vars': 'off',
        // Les catch silencieux (parse JSON tolérant) sont intentionnels
        'no-empty': ['error', { allowEmptyCatch: true }],
        // Fonctions vides intentionnelles : mocks de test, callbacks no-op RN
        '@typescript-eslint/no-empty-function': 'warn',
        // Metro/Expo : require() conditionnel est le mécanisme standard
        '@typescript-eslint/no-var-requires': 'off',
        // firebase/auth : getReactNativePersistence non exposé par les types
        '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': false }],
        'comma-spacing': ['error', { before: false, after: true }],
        'comma-dangle': ['error', 'always-multiline'],
    },
};
