// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    kodikApiToken: process.env.KODIK_API_TOKEN,
    tmdbApiKey: process.env.THMDB_API_KEY,
    public: {
      kodikApiUrl: process.env.KODIK_API_URL || 'https://kodik-api.com',
      tmdbApiUrl: 'https://api.themoviedb.org/3',
      siteUrl: process.env.SITE_URL || 'https://anichrono.vercel.app',
      yandexMetricaId: process.env.YANDEX_METRICA_ID,
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'ru',
      },
      link: [
        { rel: 'icon', type: 'image/jpeg', href: '/logo.jpg' },
        // Warm up the two image hosts used by posters; posters dominate LCP.
        { rel: 'preconnect', href: 'https://shikimori.io', crossorigin: '' },
        { rel: 'preconnect', href: 'https://image.tmdb.org', crossorigin: '' },
        { rel: 'dns-prefetch', href: 'https://shikimori.io' },
        { rel: 'dns-prefetch', href: 'https://image.tmdb.org' },
      ]
    }
  },

  alias: {
    '~/lib': './lib',
    '@/lib': './lib'
  },

  css: [
    "@/assets/styles/global.scss"
  ],

  // Public pages are identical for every visitor, so let the CDN serve a cached
  // copy and refresh it in the background. This cuts TTFB on slow connections.
  routeRules: {
    '/': { swr: 300 },
    '/catalog': { swr: 300 },
    '/schedule': { swr: 600 },
    '/movies': { swr: 300 },
    '/animes/**': { swr: 900 },
    '/movies/**': { swr: 900 },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/styles/_variables.scss" as *;
            @use "@/assets/styles/_mixins.scss" as *;
          `
        }
      }
    }
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],

  site: {
    url: process.env.SITE_URL || 'https://anichrono.vercel.app',
  },

  sitemap: {
    sources: ['/api/sitemap-urls'],
    exclude: ['/profile', '/random', '/animes/**/watch', '/movies/**/watch'],
  },

  fonts: {
    families: [
      {
        name: "Oswald",
        provider: 'google',
        weights: [500, 600],
        subsets: ['cyrillic', 'latin'],
      },
      {
        name: "Golos Text",
        provider: 'google',
        weights: [400, 500],
        subsets: ['cyrillic', 'latin'],
      },
    ]
  },
})
