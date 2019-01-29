module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  coverageDirectory: './coverage/',
  collectCoverage: true,
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
  testURL: 'https://example.com',
};
