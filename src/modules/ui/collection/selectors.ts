import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.ui.collection
export const getCollectionPageView = (state: RootState) => getState(state).view
