// vitest/config re-exports Vite's defineConfig with the `test` key typed.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        // Local dev → 127.0.0.1:3000; Docker dev → http://backend:3000
        // (set via VITE_API_PROXY_TARGET in docker-compose.yml).
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
  },
})
