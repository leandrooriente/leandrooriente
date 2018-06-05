module.exports = {
  rootDir: '../',
  collectCoverage: true,
  collectCoverageFrom: [
    '!**/index.js',
    '!**/propTypes/**/*.js',
    '**/components/**/*.js',
    '**/helpers/**/*.js',
  ],
  setupFiles: ['<rootDir>/test/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
  },
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
