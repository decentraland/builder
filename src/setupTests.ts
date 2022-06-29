import '@testing-library/jest-dom/extend-expect'
import { TextEncoder, TextDecoder } from 'util'
import * as locales from './modules/translation/languages'
import flatten from 'flat'
import { setCurrentLocale } from 'decentraland-dapps/dist/modules/translation/utils'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any
setCurrentLocale('en', flatten(locales.en))
