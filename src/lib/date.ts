import { getCurrentLocale, t } from 'decentraland-dapps/dist/modules/translation/utils'
import formatDistanceToNowI18N from 'date-fns/formatDistanceToNow'
import formatDistanceI18N from 'date-fns/formatDistance'
import en from 'date-fns/locale/en-US'
import es from 'date-fns/locale/es'
import zh from 'date-fns/locale/zh-CN'

type Options = {
  includeSeconds?: boolean
  addSuffix?: boolean
  locale?: Locale
}

const locales: Record<string, Locale> = {
  en,
  'en-EN': en,
  es,
  'es-ES': es,
  zh,
  'zh-CN': zh
}

export function formatDistanceToNow(date: number | Date, options: Options = {}) {
  return formatDistanceToNowI18N(date, includeLocale(options))
}

export function formatDistance(date: Date | number, baseDate: Date | number, options: Options = {}) {
  return formatDistanceI18N(date, baseDate, includeLocale(options))
}

export function formatTime(seconds: number) {
  if (seconds > 3600) {
    return t('time.hours', { amount: Number((seconds / 3600).toFixed(1)).toLocaleString() })
  } else if (seconds > 60) {
    return t('time.minutes', { amount: Math.round(seconds / 60) })
  } else {
    return t('time.seconds', { amount: Math.round(seconds) })
  }
}

function includeLocale(options: Options): Options {
  console.log('Current locale', getCurrentLocale)
  const locale = locales[getCurrentLocale().locale]
  return locale ? { ...options, locale } : { ...options }
}
