import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Category } from 'modules/category/types'
import { LoadAssetPacksSuccessAction, LOAD_ASSET_PACKS_SUCCESS } from 'modules/assetPack/actions'

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

export type CategoryPackReducerAction = LoadAssetPacksSuccessAction

export const categoryReducer = (state = INITIAL_STATE, action: CategoryPackReducerAction): CategoryState => {
  switch (action.type) {
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
    default:
      return state
  }
}
