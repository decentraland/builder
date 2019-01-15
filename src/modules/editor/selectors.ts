import { RootState } from 'modules/common/types'
import { EditorState, UndoableEditorState } from 'modules/editor/reducer'

export const getState: (state: RootState) => EditorState = state => state.editor.present
export const getFullState: (state: RootState) => UndoableEditorState = state => state.editor

export const getData: (state: RootState) => EditorState['data'] = state => getState(state).data

export const isLoading: (state: RootState) => boolean = state => getState(state).loading.length > 0

export const getError: (state: RootState) => EditorState['error'] = state => getState(state).error
