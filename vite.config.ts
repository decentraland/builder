import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { federation } from '@module-federation/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envVariables = loadEnv(mode, process.cwd())
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    plugins: [
      react(),
      nodePolyfills(),
      federation({
        name: 'builder',
        filename: 'remoteEntry.js',
        manifest: true,
        dts: false,
        exposes: {
          './App': './src/MFApp.tsx',
        },
        shared: {
          // Core React
          react: { singleton: true },
          'react-dom': { singleton: true },
          // Routing (v5)
          'react-router': { singleton: true },
          'react-router-dom': { singleton: true },
          history: { singleton: true },
          // Decentraland UI
          'decentraland-ui': { singleton: true },
          'decentraland-ui2': { singleton: true },
          'semantic-ui-css': { singleton: true },
          // Decentraland core libraries
          'decentraland-dapps': { singleton: true },
          'decentraland-connect': { singleton: true },
          'decentraland-transactions': { singleton: true },
          'decentraland-crypto-fetch': { singleton: true },
          '@dcl/single-sign-on-client': { singleton: true },
          '@dcl/crypto': { singleton: true },
          'dcl-catalyst-client': { singleton: true },
          // State management
          'react-redux': { singleton: true },
          'redux-saga': { singleton: true },
          reselect: { singleton: true },
          // Large shared libraries
          ethers: { singleton: true },
          thirdweb: { singleton: true },
          '@sentry/react': { singleton: true },
          'lottie-react': { singleton: true },
          // Utilities
          classnames: { singleton: true },
          'date-fns': { singleton: true },
          buffer: { singleton: true },
        },
      }),
    ],
    // Required because the CatalystClient tries to access it
    define: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'process.env': {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        VITE_REACT_APP_DCL_DEFAULT_ENV: envVariables.VITE_REACT_APP_DCL_DEFAULT_ENV,
        VITE_BASE_URL: envVariables.VITE_BASE_URL,
        VITE_INSPECTOR_PORT: envVariables.VITE_INSPECTOR_PORT,
        VITE_BIN_INDEX_JS_DEV_PORT: envVariables.VITE_BIN_INDEX_JS_DEV_PORT,
        VITE_BIN_INDEX_JS_DEV_PATH: envVariables.VITE_BIN_INDEX_JS_DEV_PATH
      },
      global: {}
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
        specs: path.resolve(__dirname, 'src/specs')
      }
    },
    server: {
      port: 3002,
      origin: 'http://localhost:3002',
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
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis'
        }
      }
    },
    build: {
      target: 'chrome89',
      commonjsOptions: {
        transformMixedEsModules: true
      },
      sourcemap: false
    },
    base: envVariables.VITE_BASE_URL
  }
})
