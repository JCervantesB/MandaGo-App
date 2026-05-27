module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(test).ts?(x)'],
  collectCoverageFrom: ['src/validation/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

