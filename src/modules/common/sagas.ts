import { all } from 'redux-saga/effects'

import { transactionSaga } from 'decentraland-dapps/dist/modules/transaction/sagas'

import { walletSaga } from 'modules/wallet/sagas'
import { translationSaga } from 'modules/translation/sagas'
import { assetPackSaga } from 'modules/assetPack/sagas'
import { modalSaga } from 'modules/modal/sagas'
import { sceneSaga } from 'modules/scene/sagas'
import { projectSaga } from 'modules/project/sagas'
import { profileSaga } from 'modules/profile/sagas'
import { editorSaga } from 'modules/editor/sagas'
import { keyboardSaga } from 'modules/keyboard/sagas'
import { analyticsSaga } from 'modules/analytics/sagas'
import { assetSaga } from 'modules/asset/sagas'
import { deploymentSaga } from 'modules/deployment/sagas'
import { mediaSaga } from 'modules/media/sagas'
import { authSaga } from 'modules/auth/sagas'
import { locationSaga } from 'modules/location/sagas'
import { syncSaga } from 'modules/sync/sagas'
import { uiSaga } from 'modules/ui/sagas'
import { poolGroupSaga } from 'modules/poolGroup/sagas'
import { poolSaga } from 'modules/pool/sagas'
import { identitySaga } from 'modules/identity/sagas'
import { landSaga } from 'modules/land/sagas'
import { tileSaga } from 'modules/tile/sagas'

export function* rootSaga() {
  yield all([
    analyticsSaga(),
    transactionSaga(),
    translationSaga(),
    walletSaga(),
    assetPackSaga(),
    modalSaga(),
    sceneSaga(),
    projectSaga(),
    poolGroupSaga(),
    poolSaga(),
    profileSaga(),
    editorSaga(),
    keyboardSaga(),
    assetSaga(),
    deploymentSaga(),
    mediaSaga(),
    authSaga(),
    locationSaga(),
    syncSaga(),
    uiSaga(),
    identitySaga(),
    landSaga(),
    tileSaga()
  ])
}
