export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const metricaId = config.public.yandexMetricaId

  if (!metricaId) {
    console.warn('Yandex Metrica ID is not defined in the environment variables (YANDEX_METRICA_ID). Analytics will not be tracked.')
    return
  }

  const w = window as any
  let started = false
  const pendingHits: Array<() => void> = []

  function start() {
    if (started) return
    started = true

    ;(function (m: any, e: any, t: string, r: string, i: string, k?: any, a?: any) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) }
      m[i].l = 1 * new Date().getTime()
      for (let j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j]?.src === r) return
      }
      k = e.createElement(t)
      a = e.getElementsByTagName(t)[0]
      k.async = 1
      k.src = r
      if (a && a.parentNode) a.parentNode.insertBefore(k, a)
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym')

    w.ym(metricaId, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      // Session replay is heavy on slow connections; keep it off unless needed.
      webvisor: false,
    })

    w.ym(metricaId, 'hit', window.location.href)
    for (const hit of pendingHits) hit()
    pendingHits.length = 0
  }

  // Analytics must not compete with the first render: load it when the page is
  // idle, or earlier if the visitor interacts with the site.
  const schedule = () => {
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(start, { timeout: 4000 })
    } else {
      setTimeout(start, 2500)
    }
  }

  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })

  for (const event of ['pointerdown', 'keydown', 'scroll'] as const) {
    window.addEventListener(event, start, { once: true, passive: true })
  }

  nuxtApp.hook('page:finish', () => {
    const hit = () => w.ym(metricaId, 'hit', window.location.href)
    if (started) hit()
    else pendingHits.push(hit)
  })
})
