export default {
  testEnvironment: 'allure-jest/node',
  setupFilesAfterEnv: ['<rootDir>/test/support/jest-setup.js'],
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
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  verbose: true,
  transformIgnorePatterns: [],
  maxWorkers: '50%', // Use 50% of available CPU cores for parallel execution
  testTimeout: 30000, // 30 seconds timeout for each test
  maxConcurrency: 5, // Limit concurrent tests to prevent API rate limiting
  workerIdleMemoryLimit: '512MB', // Restart workers after they use too much memory
  bail: false, // Don't stop on first test failure
  errorOnDeprecated: true, // Make deprecated calls throw errors
  detectOpenHandles: true, // Detect handles that prevent Jest from exiting
  forceExit: false // Don't force exit after tests complete
}
