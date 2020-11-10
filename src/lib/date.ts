import { getCurrentLocale, t } from 'decentraland-dapps/dist/modules/translation/utils'
import formatDistanceToNowI18N from 'date-fns/formatDistanceToNow'
import en from 'date-fns/locale/en-US'
import es from 'date-fns/locale/es'
import zh from 'date-fns/locale/zh-CN'

const locales: Record<string, Locale> = {
  en,
  es,
  zh
}

export function formatDistanceToNow(
  date: number | Date,
  options: {
    includeSeconds?: boolean
    addSuffix?: boolean
    locale?: Locale
  } = {}
) {
  const locale = locales[getCurrentLocale().locale]

  if (locale) {
    options.locale = locale
  }

  return formatDistanceToNowI18N(date, options)
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
