/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.spec.ts'],
    moduleNameMapper: {
        '^~/(.*)$': '<rootDir>/app/$1',
    },
    clearMocks: true,
};
