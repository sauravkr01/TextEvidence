module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  roots: ['<rootDir>/src'],
};
