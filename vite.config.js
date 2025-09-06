import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import login from './api/auth/login.js'
import callback from './api/auth/callback.js'
import logout from './api/auth/logout.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'local-auth-middleware',
      configureServer(server) {
        const handlers = {
          '/api/auth/login': login,
          '/api/auth/callback': callback,
          '/api/auth/logout': logout,
          '/auth/login': login,
          '/auth/callback': callback,
          '/auth/logout': logout,
        }
        for (const [path, handler] of Object.entries(handlers)) {
          server.middlewares.use(path, (req, res) => handler(req, res))
        }
      },
    },
  ],
  resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        '/shiki': {
          target: 'https://shikimori.one',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/shiki/, ''),
          headers: {
            'User-Agent': 'anichrono'
          }
        }
      }
    }
})
