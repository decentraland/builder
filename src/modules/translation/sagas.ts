import { createTranslationSaga } from 'decentraland-dapps/dist/modules/translation/sagas'
import * as translations from './languages'

export const translationSaga = createTranslationSaga({
  translations
})
