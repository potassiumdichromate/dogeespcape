import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // The polyfill's buffer shim default-exports the Buffer class, but
      // @dogeos/dogeos-sdk v4 expects the full `buffer` module as the default
      // import (reads `.Buffer.from`). Let `buffer` resolve to the real package.
      exclude: ['buffer'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})

