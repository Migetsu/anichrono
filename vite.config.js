import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      // Проксируем API запросы на Vercel Dev сервер (localhost:3000)
      '^/api/.*': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      // Проксируем прямые запросы к Shikimori (если используются)
      '^/shiki/.*': {
        target: 'https://shikimori.one',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/shiki/, '')
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @use "@/styles/_variables.scss" as *;
        @use "@/styles/_mixins.scss" as *;
        `
      }
    }
  }
})
