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
  maxWorkers: '10%',
  testTimeout: 60000, // Longer timeout for individual tests
  forceExit: false, // Let Jest handle cleanup properly
  detectOpenHandles: false // Disable to avoid interference with undici
}
