export default {
  testEnvironment: 'allure-jest/node',
  setupFilesAfterEnv: ['<rootDir>/test/support/jest/setup.js'],
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
  maxWorkers: '50%',
  testTimeout: 60000, // Longer timeout for individual tests
  forceExit: false, // Let Jest handle cleanup properly
  detectOpenHandles: false // Disable to avoid interference with undici
}
