import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Asset } from 'modules/asset/types'
import {
  LOAD_ASSET_PACKS_REQUEST,
  LOAD_ASSET_PACKS_SUCCESS,
  LOAD_ASSET_PACKS_FAILURE,
  SaveAssetPackSuccessAction,
  SAVE_ASSET_PACK_SUCCESS
} from 'modules/assetPack/actions'
import { AssetPackReducerAction } from 'modules/assetPack/reducer'
import {
  LOAD_COLLECTIBLES_SUCCESS,
  LoadCollectiblesSuccessAction,
  LOAD_COLLECTIBLES_REQUEST,
  LoadCollectiblesRequestAction,
  LOAD_SCENE_ASSETS,
  LoadSceneAssetsAction
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
  | LoadSceneAssetsAction

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
    case SAVE_ASSET_PACK_SUCCESS: {
      const { assetPack } = action.payload

      const newState = {
        ...state,
        data: {
          ...state.data
        }
      }

      for (let assetId of Object.keys(state.data)) {
        const asset = newState.data[assetId]
        if (asset.assetPackId === assetPack.id) {
          delete newState.data[asset.id]
        }
      }

      return newState
    }
    case LOAD_SCENE_ASSETS: {
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload.scene.assets
        }
      }
    }
    default:
      return state
  }
}
