import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
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
        '/api': 'http://localhost:3000', // vercel dev
        '/shiki': {
          target: 'https://shikimori.one',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/shiki/, ''),
          headers: {
            'User-Agent': 'anichrono'
          }
        }
      }
    }
  })
