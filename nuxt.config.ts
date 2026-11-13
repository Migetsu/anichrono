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
      yandexMetricaId: process.env.YANDEX_METRICA_ID
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'ru',
      },
      link: [
        { rel: 'icon', type: 'image/jpeg', href: '/logo.jpg' }
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
    '@nuxt/icon',
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
        weights: [500, 600, 700],
        subsets: ['cyrillic', 'latin'],
      },
      {
        name: "Golos Text",
        provider: 'google',
        weights: [400, 500, 600],
        subsets: ['cyrillic', 'latin'],
      },
    ]
  },
})