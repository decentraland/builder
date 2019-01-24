import { Store } from 'redux'
import { EventEmitter } from 'events'
import { RootState } from 'modules/common/types'
import { loadAssetPacksSuccess, LOAD_ASSET_PACKS_SUCCESS, LoadAssetPacksSuccessAction } from 'modules/assetPack/actions'
import { makeFakeAssetPack } from './helpers/assetPacks'

/**
 * An scenario that loads an Asset Pack that contains 500 assets.
 * Meant to stress-test the UI with a realistic number of assets.
 */

export function run(store: Store<RootState>, evt: EventEmitter) {
  const listener = (_: LoadAssetPacksSuccessAction) => {
    store.dispatch(loadAssetPacksSuccess([makeFakeAssetPack(500)]))
    evt.off(LOAD_ASSET_PACKS_SUCCESS, listener)
  }
  evt.on(LOAD_ASSET_PACKS_SUCCESS, listener)
}
