import { Store } from 'redux'
import { EventEmitter } from 'events'
import { RootState } from 'modules/common/types'
import { LOAD_ASSET_PACKS_SUCCESS, LoadAssetPacksSuccessAction } from 'modules/assetPack/actions'
import { addAsset } from 'modules/scene/actions'
import { Asset } from 'modules/asset/types'
import { getRandomPosition } from 'modules/scene/utils'

/**
 * An scenario that loads an Asset Pack that contains 500 assets.
 * Meant to stress-test the UI with a realistic number of assets.
 */

export function run(store: Store<RootState>, evt: EventEmitter) {
  const getRandomAsset = (assets: Asset[]) => assets[Math.floor(Math.random() * assets.length)]

  // Add a few assets to go past the triangle limit
  const assetAmount = 18

  evt.on(LOAD_ASSET_PACKS_SUCCESS, (_: LoadAssetPacksSuccessAction) => {
    setTimeout(() => {
      const state = store.getState()
      const assets = Object.values(state.asset.data)

      for (let index = 0; index < assetAmount - 2; index++) {
        const asset = getRandomAsset(assets)
        store.dispatch(addAsset(asset, getRandomPosition()))
      }

      // Add an asset too high
      store.dispatch(addAsset(assets[0], getRandomPosition({ y: 50 })))

      // Add an asset outside the scene bounds
      store.dispatch(addAsset(assets[0], getRandomPosition({ x: 20, z: 10 })))
    })
  })
}
