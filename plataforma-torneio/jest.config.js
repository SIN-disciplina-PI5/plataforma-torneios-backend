export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'api/**/*.js',
    '!api/test/**',
  ],
};
