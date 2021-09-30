import { all } from 'redux-saga/effects'

import { createProfileSaga } from 'decentraland-dapps/dist/modules/profile/sagas'
import { transactionSaga } from 'decentraland-dapps/dist/modules/transaction/sagas'

import { authorizationSaga } from 'decentraland-dapps/dist/modules/authorization/sagas'
import { analyticsSaga } from 'modules/analytics/sagas'
import { assetPackSaga } from 'modules/assetPack/sagas'
import { assetSaga } from 'modules/asset/sagas'
import { collectionSaga } from 'modules/collection/sagas'
import { committeeSaga } from 'modules/committee/sagas'
import { deploymentSaga } from 'modules/deployment/sagas'
import { editorSaga } from 'modules/editor/sagas'
import { ensSaga } from 'modules/ens/sagas'
import { forumSaga } from 'modules/forum/sagas'
import { identitySaga } from 'modules/identity/sagas'
import { itemSaga } from 'modules/item/sagas'
import { keyboardSaga } from 'modules/keyboard/sagas'
import { landSaga } from 'modules/land/sagas'
import { locationSaga } from 'modules/location/sagas'
import { mediaSaga } from 'modules/media/sagas'
import { modalSaga } from 'modules/modal/sagas'
import { poolGroupSaga } from 'modules/poolGroup/sagas'
import { poolSaga } from 'modules/pool/sagas'
import { projectSaga } from 'modules/project/sagas'
import { sceneSaga } from 'modules/scene/sagas'
import { statsSaga } from 'modules/stats/sagas'
import { syncSaga } from 'modules/sync/sagas'
import { tileSaga } from 'modules/tile/sagas'
import { toastSaga } from 'modules/toast/sagas'
import { translationSaga } from 'modules/translation/sagas'
import { uiSaga } from 'modules/ui/sagas'
import { walletSaga } from 'modules/wallet/sagas'
import { PEER_URL } from 'lib/api/peer'
import { BuilderAPI } from 'lib/api/builder'

const profileSaga = createProfileSaga({ peerUrl: PEER_URL })

export function* rootSaga(builderAPI: BuilderAPI) {
  yield all([
    analyticsSaga(),
    assetPackSaga(builderAPI),
    assetSaga(),
    authorizationSaga(),
    collectionSaga(builderAPI),
    committeeSaga(builderAPI),
    deploymentSaga(builderAPI),
    editorSaga(),
    ensSaga(),
    forumSaga(builderAPI),
    identitySaga(),
    itemSaga(builderAPI),
    keyboardSaga(),
    landSaga(),
    locationSaga(),
    mediaSaga(),
    modalSaga(),
    poolGroupSaga(builderAPI),
    poolSaga(builderAPI),
    profileSaga(),
    projectSaga(builderAPI),
    sceneSaga(),
    statsSaga(),
    syncSaga(builderAPI),
    tileSaga(),
    toastSaga(),
    transactionSaga(),
    translationSaga(),
    uiSaga(),
    walletSaga()
  ])
}
