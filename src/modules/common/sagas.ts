import { all } from 'redux-saga/effects'
import { AuthIdentity } from 'decentraland-crypto-fetch'
import { CatalystClient } from 'dcl-catalyst-client'
import { BuilderClient } from '@dcl/builder-client'
import { ApplicationName } from 'decentraland-dapps/dist/modules/features/types'

import { createProfileSaga } from 'decentraland-dapps/dist/modules/profile/sagas'
import { transactionSaga } from 'decentraland-dapps/dist/modules/transaction/sagas'
import { authorizationSaga } from 'decentraland-dapps/dist/modules/authorization/sagas'
import { toastSaga } from 'decentraland-dapps/dist/modules/toast/sagas'
import { featuresSaga } from 'decentraland-dapps/dist/modules/features/sagas'
import { createIdentitySaga } from 'decentraland-dapps/dist/modules/identity/sagas'
import { FiatGateway, createGatewaySaga } from 'decentraland-dapps/dist/modules/gateway'

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
import { thirdPartySaga } from 'modules/thirdParty/sagas'
import { tileSaga } from 'modules/tile/sagas'
import { translationSaga } from 'modules/translation/sagas'
import { uiSaga } from 'modules/ui/sagas'
import { walletSaga } from 'modules/wallet/sagas'
import { entitySaga } from 'modules/entity/sagas'
import { loginSaga } from 'modules/login/sagas'
import { newsletterSagas } from 'modules/newsletter/sagas'
import { collectionCurationSaga } from 'modules/curations/collectionCuration/sagas'
import { itemCurationSaga } from 'modules/curations/itemCuration/sagas'
import { inspectorSaga } from 'modules/inspector/sagas'
import { worldsSaga } from 'modules/worlds/sagas'
import { PEER_URL } from 'lib/api/peer'
import { BuilderAPI } from 'lib/api/builder'
import { ENSApi } from 'lib/api/ens'
import { config } from 'config'
import { getPeerWithNoGBCollectorURL } from './utils'
import { RootStore } from './types'
import { WorldsAPI } from 'lib/api/worlds'
import { TradeService } from 'decentraland-dapps/dist/modules/trades/TradeService'

const newIdentitySaga = createIdentitySaga({
  authURL: config.get('AUTH_URL')
})

const gatewaySaga = createGatewaySaga({
  [FiatGateway.WERT]: {
    marketplaceServerURL: config.get('MARKETPLACE_SERVER_URL'),
    url: '' // TODO: This is not used, it should be removed from decentraland-dapps.
  }
})

export function* rootSaga(
  builderAPI: BuilderAPI,
  newBuilderClient: BuilderClient,
  catalystClient: CatalystClient,
  getIdentity: () => AuthIdentity | undefined,
  store: RootStore,
  ensApi: ENSApi,
  worldsApi: WorldsAPI,
  tradeService: TradeService
) {
  yield all([
    analyticsSaga(),
    assetPackSaga(builderAPI),
    assetSaga(newBuilderClient),
    authorizationSaga(),
    collectionSaga(builderAPI, newBuilderClient),
    committeeSaga(builderAPI),
    deploymentSaga(builderAPI, catalystClient),
    editorSaga(),
    ensSaga(newBuilderClient, ensApi, worldsApi),
    entitySaga(catalystClient),
    forumSaga(builderAPI),
    identitySaga(),
    newIdentitySaga(),
    itemSaga(builderAPI, newBuilderClient, tradeService),
    keyboardSaga(),
    landSaga(),
    locationSaga(),
    mediaSaga(),
    modalSaga(),
    poolGroupSaga(builderAPI),
    poolSaga(builderAPI),
    createProfileSaga({ peerUrl: PEER_URL, peerWithNoGbCollectorUrl: getPeerWithNoGBCollectorURL(), getIdentity })(),
    projectSaga(builderAPI),
    sceneSaga(builderAPI),
    statsSaga(),
    syncSaga(builderAPI),
    thirdPartySaga(builderAPI, catalystClient),
    tileSaga(),
    toastSaga(),
    transactionSaga(),
    translationSaga(),
    uiSaga(),
    walletSaga(),
    collectionCurationSaga(builderAPI),
    itemCurationSaga(builderAPI),
    featuresSaga({ polling: { apps: [ApplicationName.BUILDER, ApplicationName.DAPPS], delay: 60000 /** 60 seconds */ } }),
    inspectorSaga(builderAPI, store),
    loginSaga(),
    newsletterSagas(builderAPI),
    worldsSaga(worldsApi),
    gatewaySaga()
  ])
}
