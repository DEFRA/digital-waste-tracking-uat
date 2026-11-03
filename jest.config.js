export default {
  testEnvironment: 'allure-jest/node',
  setupFilesAfterEnv: ['<rootDir>/test/support/jest/setup.js'],
  globalSetup: '<rootDir>/test/support/jest/global-setup.js',
  globalTeardown: '<rootDir>/test/support/jest/global-teardown.js',
  reporters: [
    'default',
    ['github-actions', { silent: false }],
    'summary',
    '<rootDir>/test/support/jest/custom-reporter.js'
  ],
  transform: {},
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1'
  },
  testMatch: ['**/test/specs/**/*.js'],
  verbose: true,
  transformIgnorePatterns: [],
  maxWorkers: 2, // Reduce API request bursts and HTTP 429s. See README.md#api-rate-limits-and-test-workers.
  testTimeout: 60000, // Longer timeout for individual tests
  forceExit: false, // Let Jest handle cleanup properly
  detectOpenHandles: false // Disable to avoid interference with undici
}
