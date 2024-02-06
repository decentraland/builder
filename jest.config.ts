/* eslint-disable */
import type { Config } from 'jest'

export default async (): Promise<Config> => {
  return {
    verbose: true,
    testEnvironment: 'jsdom',
    setupFiles: ['<rootDir>/src/tests/beforeSetupTests.ts'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/afterSetupTest.ts'],
    transform: {
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
        '<rootDir>/src/tests/config/fileTransformer.cjs',
      '^.+\\.(t|j)sx?$': [
        '@swc/jest',
        {
          jsc: {
            transform: {
              react: {
                runtime: 'automatic'
              }
            }
          }
        }
      ]
    },
    testRegex: '(/__tests__/.*|(\\.|/)(spec))\\.[jt]sx?$',
    moduleNameMapper: {
      '^three/.*$': 'identity-obj-proxy',
      'decentraland-ecs': 'identity-obj-proxy',
      '^.*/modules/curations/collectionCuration/toasts.*$': 'identity-obj-proxy',
      '@dcl/ecs': 'identity-obj-proxy',
      '^.+?raw': 'identity-obj-proxy',
      '@dcl/single-sign-on-client': 'identity-obj-proxy',
      '\\.(css|less)$': 'identity-obj-proxy',
      '^components/(.*)$': '<rootDir>/src/components/$1',
      '^config$': '<rootDir>/src/config',
      '^contracts(/.*)$': '<rootDir>/src/contracts/$1',
      '^contracts$': '<rootDir>/src/contracts',
      '^ecsScene/(.*)$': '<rootDir>/src/ecsScene/$1',
      '^experiments/(.*)$': '<rootDir>/src/experiments/$1',
      '^icons/(.*)$': '<rootDir>/src/icons/$1',
      '^images/(.*)$': '<rootDir>/src/images/$1',
      '^lib/(.*)$': '<rootDir>/src/lib/$1',
      '^modules/(.*)$': '<rootDir>/src/modules/$1',
      '^routing/(.*)$': '<rootDir>/src/routing/$1',
      '^specs/(.*)$': '<rootDir>/src/specs/$1'
    },
    transformIgnorePatterns: ['node_modules/?!@0xsquid|eccrypto|libsodium-wrappers-sumo']
  }
}
