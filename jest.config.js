export default {
  // testEnvironment: '<rootDir>/test/setup/jestTestEnvironment.js',
  testEnvironment: 'allure-jest/node',
  setupFilesAfterEnv: ['<rootDir>/test/setup/jestSetupFilesAfterEnv.js'],
  transform: {},
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
    '^page-objects/(.*)$': '<rootDir>/test/page-objects/$1',
    '^components/(.*)$': '<rootDir>/test/components/$1'
  },
  testMatch: ['**/test/specs/**/*.js'],
  collectCoverageFrom: [
    'test/**/*.js',
    '!test/**/*.test.js',
    '!test/setup/**/*.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  verbose: true,
  transformIgnorePatterns: [],
  maxWorkers: '50%', // Use 50% of available CPU cores for parallel execution
  testTimeout: 30000, // 30 seconds timeout for each test
  maxConcurrency: 5, // Limit concurrent tests to prevent API rate limiting
  workerIdleMemoryLimit: '512MB' // Restart workers after they use too much memory
}
