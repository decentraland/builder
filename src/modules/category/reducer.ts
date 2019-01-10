import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Category } from 'modules/category/types'
import { LOAD_ASSET_PACKS_REQUEST, LOAD_ASSET_PACKS_SUCCESS, LOAD_ASSET_PACKS_FAILURE } from 'modules/assetPack/actions'
import { AssetPackReducerAction } from 'modules/assetPack/reducer'

export type CategoryState = {
  data: DataByKey<Category>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: CategoryState = {
  data: {},
  loading: [],
  error: null
}

export type CategoryPackReducerAction = AssetPackReducerAction

export const categoryReducer = (state = INITIAL_STATE, action: CategoryPackReducerAction): CategoryState => {
  switch (action.type) {
    case LOAD_ASSET_PACKS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_ASSET_PACKS_SUCCESS: {
      const { assetPacks } = action.payload
      const categories: CategoryState['data'] = {}

      for (const assetPack of assetPacks) {
        for (const asset of assetPack.assets) {
          const categoryName = asset.category

          if (!categories[categoryName]) {
            categories[categoryName] = { name: categoryName, assets: [] }
          }

          categories[categoryName].assets = [...categories[categoryName].assets, asset.id]
        }
      }
      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          ...categories
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
