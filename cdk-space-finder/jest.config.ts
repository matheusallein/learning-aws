import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  verbose: true,
  preset: 'ts-jest',
  testMatch: ['**/tests/*.test.ts']
}

export default config;
