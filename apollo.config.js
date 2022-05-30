import * as path from 'path';
import { loadEnv } from 'vue-cli-plugin-apollo/utils/load-env';

// Load .env files
const env = loadEnv([
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '.env.local')
])

module.exports = {
  client: {
    service: env.VITE_APOLLO_ENGINE_SERVICE,
    includes: ['src/**/*.{js,jsx,ts,tsx,vue,gql}']
  },
  service: {
    name: env.VITE_APOLLO_ENGINE_SERVICE,
    localSchemaFile: path.resolve(__dirname, './src/graphql/schema.json')
  },
  engine: {
    endpoint: import.meta.env.APOLLO_ENGINE_API_ENDPOINT,
    apiKey: env.VITE_APOLLO_ENGINE_KEY
  }
}
