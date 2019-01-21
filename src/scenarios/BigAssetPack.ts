import { Store } from 'redux'
import { RootState } from 'modules/common/types'
import { loadAssetPacksSuccess, LOAD_ASSET_PACKS_SUCCESS, LoadAssetPacksSuccessAction } from 'modules/assetPack/actions'
import { makeFakeAssetPack } from './helpers/assetPacks'
import { EventEmitter } from 'events'

/**
 * An scenario that loads an Asset Pack that contains 500 assets.
 * Meant to stress-test the UI with a realistic number of assets.
 */

export function run(store: Store<RootState>, evt: EventEmitter) {
  let flag = true
  evt.on(LOAD_ASSET_PACKS_SUCCESS, (action: LoadAssetPacksSuccessAction) => {
    if (flag) {
      flag = false
      store.dispatch(loadAssetPacksSuccess([makeFakeAssetPack(500)]))
    }
  })
}
