import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envVariables = loadEnv(mode, process.cwd())
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    plugins: [
      react(),
      nodePolyfills({
        protocolImports: true,
        globals: {
          Buffer: true,
          global: true,
          process: true
        }
      })
    ],
    // Required because the CatalystClient tries to access it
    define: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'process.env.VITE_REACT_APP_DCL_DEFAULT_ENV': JSON.stringify(envVariables.VITE_REACT_APP_DCL_DEFAULT_ENV),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'process.env.VITE_BASE_URL': JSON.stringify(envVariables.VITE_BASE_URL),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'process.env.VITE_INSPECTOR_PORT': JSON.stringify(envVariables.VITE_INSPECTOR_PORT),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'process.env.VITE_BIN_INDEX_JS_DEV_PORT': JSON.stringify(envVariables.VITE_BIN_INDEX_JS_DEV_PORT),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'process.env.VITE_BIN_INDEX_JS_DEV_PATH': JSON.stringify(envVariables.VITE_BIN_INDEX_JS_DEV_PATH)
    },
    resolve: {
      alias: {
        // App aliases
        components: path.resolve(__dirname, 'src/components'),
        config: path.resolve(__dirname, 'src/config'),
        contracts: path.resolve(__dirname, 'src/contracts'),
        ecsScene: path.resolve(__dirname, 'src/escScene'),
        experiments: path.resolve(__dirname, 'src/experiments'),
        icons: path.resolve(__dirname, 'src/icons'),
        images: path.resolve(__dirname, 'src/images'),
        lib: path.resolve(__dirname, 'src/lib'),
        modules: path.resolve(__dirname, 'src/modules'),
        routing: path.resolve(__dirname, 'src/routing'),
        specs: path.resolve(__dirname, 'src/specs'),
        // Fix ua-parser-js ESM bug - force CommonJS versions
        'ua-parser-js/helpers': path.resolve(__dirname, 'node_modules/ua-parser-js/src/helpers/ua-parser-helpers.js'),
        'ua-parser-js': path.resolve(__dirname, 'node_modules/ua-parser-js/src/main/ua-parser.js')
      }
    },
    server: {
      proxy: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '/auth': {
          target: 'https://decentraland.zone',
          followRedirects: true,
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    },
    optimizeDeps: {
      include: ['buffer', 'process', 'stream-browserify'],
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis'
        }
      }
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true
      },
      sourcemap: false
    },
    base: envVariables.VITE_BASE_URL
  }
})
