import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
    proxy: {
      '^/shiki/.*': {
        target: 'https://shikimori.one',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/shiki/, '')
      }
    }
  }
  })
