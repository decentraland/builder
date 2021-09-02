import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { AssetPack, ProgressStage } from 'modules/assetPack/types'
import {
  LoadAssetPacksRequestAction,
  LoadAssetPacksSuccessAction,
  LoadAssetPacksFailureAction,
  SaveAssetPackFailureAction,
  SaveAssetPackRequestAction,
  SaveAssetPackSuccessAction,
  DeleteAssetPackSuccessAction,
  SetProgressAction,
  LOAD_ASSET_PACKS_REQUEST,
  LOAD_ASSET_PACKS_SUCCESS,
  LOAD_ASSET_PACKS_FAILURE,
  SAVE_ASSET_PACK_FAILURE,
  SAVE_ASSET_PACK_REQUEST,
  SAVE_ASSET_PACK_SUCCESS,
  DELETE_ASSET_PACK_SUCCESS,
  SET_PROGRESS,
  ClearAssetPacksAction,
  CLEAR_ASSET_PACKS
} from 'modules/assetPack/actions'

export type AssetPackState = {
  data: ModelById<AssetPack>
  progress: {
    stage: ProgressStage
    value: number
  }
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: AssetPackState = {
  data: {},
  loading: [],
  progress: {
    stage: ProgressStage.NONE,
    value: 0
  },
  error: null
}

export type AssetPackReducerAction =
  | LoadAssetPacksRequestAction
  | LoadAssetPacksSuccessAction
  | LoadAssetPacksFailureAction
  | SaveAssetPackFailureAction
  | DeleteAssetPackSuccessAction
  | SetProgressAction
  | SaveAssetPackRequestAction
  | SaveAssetPackSuccessAction
  | ClearAssetPacksAction

export const assetPackReducer = (state = INITIAL_STATE, action: AssetPackReducerAction): AssetPackState => {
  switch (action.type) {
    case LOAD_ASSET_PACKS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_ASSET_PACKS_SUCCESS: {
      const { assetPacks } = action.payload
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          ...assetPacks.reduce(
            (accum, assetPack) => ({
              ...accum,
              [assetPack.id]: {
                ...assetPack,
                assets: assetPack.assets.map(asset => asset.id)
              }
            }),
            {}
          )
        }
      }
    }
    case LOAD_ASSET_PACKS_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case SAVE_ASSET_PACK_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case SAVE_ASSET_PACK_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case SAVE_ASSET_PACK_FAILURE: {
      return {
        ...state,
        error: action.payload.error,
        loading: loadingReducer(state.loading, action)
      }
    }
    case DELETE_ASSET_PACK_SUCCESS: {
      const { assetPack } = action.payload
      const newState = {
        ...state,
        data: {
          ...state.data
        }
      }
      delete newState.data[assetPack.id]
      return newState
    }
    case SET_PROGRESS: {
      const { stage, value } = action.payload
      return {
        ...state,
        progress: {
          stage,
          value
        }
      }
    }
    case CLEAR_ASSET_PACKS: {
      return INITIAL_STATE
    }
    default:
      return state
  }
}
