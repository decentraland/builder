import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { CategoryState } from 'modules/category/reducer'
import { AssetState } from 'modules/asset/reducer'
import { FullCategory } from 'modules/category/types'
import { getData as getAssets } from 'modules/asset/selectors'

export const getState: (state: RootState) => CategoryState = state => state.category

export const getData: (state: RootState) => CategoryState['data'] = state => getState(state).data

export const isLoading: (state: RootState) => boolean = state => getState(state).loading.length > 0

export const getError: (state: RootState) => CategoryState['error'] = state => getState(state).error

export const getCategories = createSelector<RootState, CategoryState['data'], AssetState['data'], FullCategory[]>(
  getData,
  getAssets,
  (categories, assets) =>
    Object.values(categories).map(category => ({
      ...category,
      assets: category.assets.map(assetId => assets[assetId])
    }))
)
