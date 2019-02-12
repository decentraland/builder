import { all } from 'redux-saga/effects'
import { locationSaga } from 'decentraland-dapps/dist/modules/location/sagas'
import { analyticsSaga } from 'decentraland-dapps/dist/modules/analytics/sagas'

import { walletSaga } from 'modules/wallet/sagas'
import { translationSaga } from 'modules/translation/sagas'
import { assetPackSaga } from 'modules/assetPack/sagas'
import { contestSaga } from 'modules/contest/sagas'
import { sceneSaga } from 'modules/scene/sagas'
import { projectSaga } from 'modules/project/sagas'
import { editorSaga } from 'modules/editor/sagas'
import { keyboardSaga } from 'modules/keyboard/sagas'

export function* rootSaga() {
  yield all([
    locationSaga(),
    analyticsSaga(),
    translationSaga(),
    walletSaga(),
    assetPackSaga(),
    contestSaga(),
    sceneSaga(),
    projectSaga(),
    editorSaga(),
    keyboardSaga()
  ])
}
