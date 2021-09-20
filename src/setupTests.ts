import * as locales from './modules/translation/languages'
import flatten from 'flat'
import { setCurrentLocale } from 'decentraland-dapps/dist/modules/translation/utils'

setCurrentLocale('en', flatten(locales.en))
