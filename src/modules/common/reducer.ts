import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { History } from 'history'
import { locationReducer as location } from 'decentraland-dapps/dist/modules/location/reducer'
import { translationReducer as translation } from 'decentraland-dapps/dist/modules/translation/reducer'
import { storageReducer as storage, storageReducerWrapper } from 'decentraland-dapps/dist/modules/storage/reducer'
import { walletReducer as wallet } from 'decentraland-dapps/dist/modules/wallet/reducer'
import { modalReducer as modal } from 'decentraland-dapps/dist/modules/modal/reducer'

import { RootState } from 'modules/common/types'
import { assetPackReducer as assetPack } from 'modules/assetPack/reducer'
import { editorReducer as editor } from 'modules/editor/reducer'
import { assetReducer as asset } from 'modules/asset/reducer'
import { categoryReducer as category } from 'modules/category/reducer'
import { projectReducer as project } from 'modules/project/reducer'
import { sceneReducer as scene } from 'modules/scene/reducer'

export function createRootReducer(history: History) {
  return storageReducerWrapper(
    combineReducers<RootState>({
      storage,
      location,
      editor,
      translation,
      wallet,
      modal,
      assetPack,
      asset,
      category,
      project,
      scene,
      router: connectRouter(history)
    })
  )
}
