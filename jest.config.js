module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.d.ts'],
  testMatch: ['<rootDir>/src/**/?(*.)spec.{js,ts}'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^!?raw-loader!.*$': 'identity-obj-proxy',
    '^three/.*$': 'identity-obj-proxy',
    '^@babylonjs.*$': 'identity-obj-proxy',
    '^.*/modules/curations/collectionCuration/toasts.*$': 'identity-obj-proxy'
  },
  modulePaths: ['<rootDir>/src/'],
  setupFiles: ['<rootDir>/src/setupTests.ts']
}
