import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Asset } from 'modules/asset/types'
import { LOAD_ASSET_PACKS_REQUEST, LOAD_ASSET_PACKS_SUCCESS, LOAD_ASSET_PACKS_FAILURE } from 'modules/assetPack/actions'
import { AssetPackReducerAction } from 'modules/assetPack/reducer'

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

export type AssetReducerAction = AssetPackReducerAction

export const assetReducer = (state = INITIAL_STATE, action: AssetReducerAction): AssetState => {
  switch (action.type) {
    case LOAD_ASSET_PACKS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
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
    case LOAD_ASSET_PACKS_FAILURE: {
      return { ...state, loading: loadingReducer(state.loading, action), error: action.payload.error }
    }
    default:
      return state
  }
}
