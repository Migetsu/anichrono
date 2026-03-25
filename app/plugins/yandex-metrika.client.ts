export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const metricaId = config.public.yandexMetricaId

  if (!metricaId) {
    console.warn('Yandex Metrica ID is not defined in the environment variables (YANDEX_METRICA_ID). Analytics will not be tracked.')
    return
  }

  // Inject Script
  ;(function(m: any, e: any, t: string, r: string, i: string, k?: any, a?: any) {
    m[i] = m[i] || function() { (m[i].a = m[i].a || []).push(arguments) };
    m[i].l = 1 * new Date().getTime();
    for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j]?.src === r) { return; } }
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    if (a && a.parentNode) {
      a.parentNode.insertBefore(k, a);
    }
  })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  // Initialize
  (window as any).ym(metricaId, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true // You can set this to false if you don't use Webvisor
  });

  // Track page views on route change
  nuxtApp.hook('page:finish', () => {
    (window as any).ym(metricaId, 'hit', window.location.href);
  })
})
