import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.editor
export const getEditorMode = (state: RootState) => getState(state).mode
export const isSidebarOpen = (state: RootState) => getState(state).sidebar
export const isPreviewing = (state: RootState) => getState(state).preview
export const getSelectedEntityId = (state: RootState) => getState(state).selectedEntityId
