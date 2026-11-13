/**
 * Date formatting for broadcast times.
 *
 * Times are rendered on the server (schedule page) and in the browser, so the
 * timezone must be identical in both places: a local-time formatter makes the
 * SSR markup and the hydrated markup differ. Moscow time matches the offset
 * Shikimori uses for the airing calendar and the Russian audience.
 */

export const DISPLAY_TIME_ZONE = 'Europe/Moscow'

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: DISPLAY_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
})

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: DISPLAY_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const dayLabelFormatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: DISPLAY_TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const dayMonthFormatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: DISPLAY_TIME_ZONE,
  day: 'numeric',
  month: 'long',
})

export function formatTime(date: Date): string {
  return timeFormatter.format(date)
}

/** Stable calendar key in the display timezone, e.g. `2026-11-13`. */
export function dayKey(date: Date): string {
  return dayKeyFormatter.format(date)
}

export function dayLabel(date: Date): string {
  const label = dayLabelFormatter.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function dayMonth(date: Date): string {
  return dayMonthFormatter.format(date)
}

export function isTodayInDisplayZone(date: Date): boolean {
  return dayKey(date) === dayKey(new Date())
}

export function relativeDayLabel(date: Date): string {
  const key = dayKey(date)
  const today = dayKey(new Date())
  const tomorrow = dayKey(new Date(Date.now() + 24 * 60 * 60 * 1000))

  if (key === today) return `Сегодня, ${dayMonth(date)}`
  if (key === tomorrow) return `Завтра, ${dayMonth(date)}`
  return dayLabel(date)
}
