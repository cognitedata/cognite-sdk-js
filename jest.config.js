module.exports = {
  roots: ['<rootDir>/packages'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(\\.|/)(test|spec)\\.tsx?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  coverageDirectory: './coverage/',
  collectCoverage: true,
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '^sdk-([a-z]+)\/(.+)$': '<rootDir>/packages/$1/src/$2',
  },
  testURL: 'https://localhost',
};
