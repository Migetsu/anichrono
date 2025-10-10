import { ref } from 'vue'

export function useShare() {
  const isSupported = ref(false)
  const isSharing = ref(false)
  const shareError = ref('')

  // Проверяем поддержку Web Share API
  if (typeof navigator !== 'undefined' && navigator.share) {
    isSupported.value = true
  }

  /**
   * Поделиться контентом
   * @param {Object} shareData - Данные для шаринга
   * @param {string} shareData.title - Заголовок
   * @param {string} shareData.text - Текст
   * @param {string} shareData.url - URL
   */
  async function share(shareData) {
    if (!shareData) {
      throw new Error('Данные для шаринга не предоставлены')
    }

    isSharing.value = true
    shareError.value = ''

    try {
      // Если поддерживается Web Share API
      if (isSupported.value) {
        await navigator.share(shareData)
        return { success: true, method: 'native' }
      } else {
        // Fallback - копируем в буфер обмена
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`
        await copyToClipboard(shareText)
        return { success: true, method: 'clipboard' }
      }
    } catch (error) {
      shareError.value = error.message
      
      // Если пользователь отменил шаринг, не считаем это ошибкой
      if (error.name === 'AbortError') {
        return { success: false, method: 'cancelled' }
      }
      
      // Попробуем fallback к копированию в буфер
      try {
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`
        await copyToClipboard(shareText)
        return { success: true, method: 'clipboard-fallback' }
      } catch (fallbackError) {
        throw new Error('Не удалось поделиться контентом')
      }
    } finally {
      isSharing.value = false
    }
  }

  /**
   * Копировать текст в буфер обмена
   * @param {string} text - Текст для копирования
   */
  async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
      } finally {
        document.body.removeChild(textArea)
      }
    }
  }

  /**
   * Поделиться аниме
   * @param {Object} anime - Данные аниме
   * @param {string} currentUrl - Текущий URL
   */
  async function shareAnime(anime, currentUrl) {
    const shareData = {
      title: `Смотри "${anime.russian || anime.name}" на AniChrono`,
      text: `Рейтинг: ${anime.score} | Год: ${anime.airedOn?.year || 'Неизвестно'} | ${anime.episodes} серий`,
      url: currentUrl
    }

    return await share(shareData)
  }

  /**
   * Поделиться страницей просмотра
   * @param {Object} anime - Данные аниме
   * @param {string} currentUrl - Текущий URL
   */
  async function shareWatchPage(anime, currentUrl) {
    const shareData = {
      title: `Смотрю "${anime.russian || anime.name}" на AniChrono`,
      text: `Присоединяйся к просмотру! Рейтинг: ${anime.score} | Год: ${anime.airedOn?.year || 'Неизвестно'}`,
      url: currentUrl
    }

    return await share(shareData)
  }

  return {
    isSupported,
    isSharing,
    shareError,
    share,
    shareAnime,
    shareWatchPage,
    copyToClipboard
  }
}
