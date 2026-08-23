/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  moduleNameMapper: {
    '\\.module\\.css$': 'identity-obj-proxy',
    '\\.(css|less|scss|svg|png|jpg|webp)$': '<rootDir>/src/test/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/main.tsx',
    '!src/test/**',
    '!src/types/**',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: { statements: 70, branches: 60, functions: 65, lines: 70 },
  },
  clearMocks: true,
  restoreMocks: true,
};
