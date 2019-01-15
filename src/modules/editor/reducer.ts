import undoable, { StateWithHistory } from 'redux-undo'
import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { EditorScene } from 'modules/editor/types'
import { UPDATE_EDITOR, EDITOR_UNDO, EDITOR_REDO, UpdateEditorAction } from 'modules/editor/actions'

export type EditorState = {
  data: DataByKey<EditorScene>
  loading: LoadingState
  error: string | null
}
export type UndoableEditorState = StateWithHistory<EditorState>

const INITIAL_STATE: EditorState = {
  data: {},
  loading: [],
  error: null
}

export type EditorReducerAction = UpdateEditorAction

const baseEditorReducer = (state = INITIAL_STATE, action: EditorReducerAction): EditorState => {
  switch (action.type) {
    case UPDATE_EDITOR: {
      const { sceneId, scene } = action.payload
      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          [sceneId]: { ...scene }
        }
      }
    }
    default:
      return state
  }
}

// This is typed `as any` because undoable uses AnyAction from redux which doesn't account for the payload we use
// so types don't match
export const editorReducer = undoable<EditorState>(baseEditorReducer as any, {
  limit: 10,
  undoType: EDITOR_UNDO,
  redoType: EDITOR_REDO
})
