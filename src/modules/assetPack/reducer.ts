import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { AssetPack, ProgressStage } from 'modules/assetPack/types'
import {
  LoadAssetPacksRequestAction,
  LoadAssetPacksSuccessAction,
  LoadAssetPacksFailureAction,
  SetProgressAction,
  LOAD_ASSET_PACKS_REQUEST,
  LOAD_ASSET_PACKS_SUCCESS,
  LOAD_ASSET_PACKS_FAILURE,
  SET_PROGRESS
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
  | SetProgressAction

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
        loading: loadingReducer(state.loading, action),
        error: null,
        progress: { stage: ProgressStage.NONE, value: 0 },
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
    default:
      return state
  }
}
