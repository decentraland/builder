import { RootState } from 'modules/common/types'

const getState = (state: RootState) => state.ui.createMultipleItems

export const getMultipleItemsSaveState = (state: RootState) => getState(state).state
export const getSavedItemsFiles = (state: RootState) => getState(state).savedItemsFiles
export const getNotSavedItemsFiles = (state: RootState) => getState(state).notSavedItemsFiles
export const getCanceledItemsFiles = (state: RootState) => getState(state).cancelledItemFiles
export const getProgress = (state: RootState) => getState(state).progress
