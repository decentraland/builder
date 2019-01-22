import { createTranslationSaga } from 'decentraland-dapps/dist/modules/translation/sagas'
import * as languages from './languages'

export const translationSaga = createTranslationSaga({
  translations: languages
})
