module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@al-husseiniya/types$': '<rootDir>/../packages/types/src',
    '^@al-husseiniya/config$': '<rootDir>/../packages/config/src',
    '^@al-husseiniya/utils$': '<rootDir>/../packages/utils/src',
    '^@al-husseiniya/ui$': '<rootDir>/../packages/ui/src',
  },
};
