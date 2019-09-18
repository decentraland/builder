import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Asset } from 'modules/asset/types'
import {
  LOAD_ASSET_PACKS_REQUEST,
  LOAD_ASSET_PACKS_SUCCESS,
  LOAD_ASSET_PACKS_FAILURE,
  SAVE_ASSET_PACK_SUCCESS,
  SaveAssetPackSuccessAction
} from 'modules/assetPack/actions'
import { AssetPackReducerAction } from 'modules/assetPack/reducer'
import {
  LOAD_COLLECTIBLES_SUCCESS,
  LoadCollectiblesSuccessAction,
  LOAD_COLLECTIBLES_REQUEST,
  LoadCollectiblesRequestAction
} from './actions'

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

export type AssetReducerAction =
  | AssetPackReducerAction
  | LoadCollectiblesSuccessAction
  | LoadCollectiblesRequestAction
  | SaveAssetPackSuccessAction

export const assetReducer = (state = INITIAL_STATE, action: AssetReducerAction): AssetState => {
  switch (action.type) {
    case LOAD_COLLECTIBLES_REQUEST:
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
    case SAVE_ASSET_PACK_SUCCESS: {
      const { assetPack } = action.payload

      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          ...assetPack.assets.reduce<AssetState['data']>((acc, asset) => {
            acc[asset.id] = asset
            return acc
          }, {})
        }
      }
    }
    case LOAD_ASSET_PACKS_FAILURE: {
      return { ...state, loading: loadingReducer(state.loading, action), error: action.payload.error }
    }
    case LOAD_COLLECTIBLES_SUCCESS: {
      const assets: AssetState['data'] = {}

      for (const asset of action.payload.assets) {
        assets[asset.id] = { ...asset }
      }

      return { ...state, loading: loadingReducer(state.loading, action), error: null, data: { ...state.data, ...assets } }
    }
    default:
      return state
  }
}
