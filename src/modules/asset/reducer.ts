import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Asset } from 'modules/asset/types'
import { LoadAssetPacksSuccessAction, LOAD_ASSET_PACKS_SUCCESS } from 'modules/assetPack/actions'

export type AssetState = {
  data: ModelById<Asset>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: AssetState = {
  data: {},
  loading: [],
  error: null
}

export type AssetReducerAction = LoadAssetPacksSuccessAction

export const assetReducer = (state = INITIAL_STATE, action: AssetReducerAction): AssetState => {
  switch (action.type) {
    case LOAD_ASSET_PACKS_SUCCESS: {
      const { assetPacks } = action.payload
      const assets: AssetState['data'] = {}

      for (const assetPack of assetPacks) {
        for (const asset of assetPack.assets) {
          assets[asset.id] = { ...asset }
        }
      }
      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          ...assets
        }
      }
    }
    default:
      return state
  }
}
