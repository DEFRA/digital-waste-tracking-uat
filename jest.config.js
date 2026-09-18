export default {
  testEnvironment: 'allure-jest/node',
  setupFilesAfterEnv: ['<rootDir>/test/support/jest/setup.js'],
  globalSetup:
    process.env.EXCLUDE_GLOBAL_SETUP === 'true'
      ? undefined
      : '<rootDir>/test/support/jest/global-setup.js',
  globalTeardown: '<rootDir>/test/support/jest/global-teardown.js',
  reporters: [
    'default',
    ['github-actions', { silent: false }],
    'summary',
    '<rootDir>/test/support/jest/custom-reporter.js'
  ],
  transform: {},
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
    '^page-objects/(.*)$': '<rootDir>/test/page-objects/$1',
    '^components/(.*)$': '<rootDir>/test/components/$1'
  },
  testMatch: ['**/test/specs/**/*.js'],
  verbose: true,
  transformIgnorePatterns: [],
  maxWorkers: 4, // Limited to 4 to avoid 429s in dev/test (single instance). Reduced from 5 to avoid CDP rate limiting. If it happens again, raise with CDP team.
  testTimeout: 60000, // Longer timeout for individual tests
  forceExit: false, // Let Jest handle cleanup properly
  detectOpenHandles: false // Disable to avoid interference with undici
}
