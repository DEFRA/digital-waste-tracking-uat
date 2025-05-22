export default {
  testEnvironment: 'allure-jest/node',
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
  setupFilesAfterEnv: ['<rootDir>/test/setup/setup.js']
}
