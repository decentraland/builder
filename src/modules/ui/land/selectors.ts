import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.ui.land
export const getLandPageView = (state: RootState) => getState(state).view
