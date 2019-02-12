import undoable, { StateWithHistory, includeAction } from 'redux-undo'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { EDITOR_UNDO, EDITOR_REDO, OPEN_EDITOR } from 'modules/editor/actions'
import { Scene } from 'modules/scene/types'
import {
  ProvisionSceneAction,
  PROVISION_SCENE,
  UpdateMetricsAction,
  UPDATE_METRICS,
  UpdateTransfromAction,
  SetGroundAction
} from 'modules/scene/actions'

export type SceneState = {
  data: ModelById<Scene>
  loading: LoadingState
  error: string | null
}
export type UndoableSceneState = StateWithHistory<SceneState>

export type SceneReducerAction = ProvisionSceneAction | UpdateMetricsAction | UpdateTransfromAction | SetGroundAction

const INITIAL_STATE: SceneState = {
  data: {},
  loading: [],
  error: null
}

const baseSceneReducer = (state: SceneState = INITIAL_STATE, action: SceneReducerAction): SceneState => {
  switch (action.type) {
    case PROVISION_SCENE: {
      const { newScene } = action.payload

      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          [newScene.id]: { ...newScene }
        }
      }
    }

    case UPDATE_METRICS: {
      const { sceneId, metrics, limits } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [sceneId]: {
            ...state.data[sceneId],
            metrics: {
              ...state.data[sceneId].metrics,
              ...metrics
            },
            limits: {
              ...state.data[sceneId].limits,
              ...limits
            }
          }
        }
      }
    }

    default:
      return state
  }
}

// This is typed `as any` because undoable uses AnyAction from redux which doesn't account for the payload we use
// so types don't match
export const sceneReducer = undoable<SceneState>(baseSceneReducer as any, {
  limit: 48,
  undoType: EDITOR_UNDO,
  redoType: EDITOR_REDO,
  clearHistoryType: OPEN_EDITOR,
  filter: includeAction(PROVISION_SCENE)
})
