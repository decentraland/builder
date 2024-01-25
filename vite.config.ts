import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import react from '@vitejs/plugin-react-swc'
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'
import path from 'path'
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const envVariables = loadEnv(mode, process.cwd())
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    plugins: [react(), splitVendorChunkPlugin()],
    // Required because the CatalystClient tries to access it
    define: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'process.env': {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        VITE_REACT_APP_DCL_DEFAULT_ENV: envVariables.VITE_REACT_APP_DCL_DEFAULT_ENV,
        VITE_BASE_URL: envVariables.VITE_BASE_URL
      },
      global: {}
    },
    resolve: {
      alias: {
        // This Rollup aliases are extracted from @esbuild-plugins/node-modules-polyfill,
        // see https://github.com/remorses/esbuild-plugins/blob/master/node-modules-polyfill/src/polyfills.ts
        // process and buffer are excluded because already managed
        // by node-globals-polyfill
        util: 'rollup-plugin-node-polyfills/polyfills/util',
        crypto: 'rollup-plugin-node-polyfills/polyfills/crypto-browserify',
        path: 'rollup-plugin-node-polyfills/polyfills/path',
        assert: 'rollup-plugin-node-polyfills/polyfills/assert',
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
        // themes: path.resolve(__dirname, 'src/themes')
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
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis'
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin({
            buffer: false,
            process: true
          }),
          NodeModulesPolyfillPlugin()
        ]
      }
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true
      },
      rollupOptions: {
        plugins: [rollupNodePolyFill()]
      },
      sourcemap: true
    },
    ...(command === 'build' ? { base: envVariables.VITE_BASE_URL } : undefined)
  } as any
})
