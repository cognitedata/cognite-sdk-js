module.exports = {
  testEnvironment: 'jsdom',
  testTimeout: 10000,
  roots: ['<rootDir>/packages/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '\\.(test|spec)\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  coverageDirectory: './coverage/',
  collectCoverage: false,
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '^sdk-([a-z]+)/(.+)$': '<rootDir>/packages/$1/src/$2',
    axios: 'axios/dist/node/axios.cjs',
  },
  testURL: 'https://localhost',
};
