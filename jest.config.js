module.exports = {
  preset: 'jest-expo',
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  // RNTL 14 : les matchers Jest sont étendus automatiquement dès l'import
  // de @testing-library/react-native — pas de setupFilesAfterEnv nécessaire.
};
