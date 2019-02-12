import undoable, { StateWithHistory, includeAction } from 'redux-undo'
import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { ModelById } from 'decentraland-dapps/dist/lib/types'

import { EDITOR_UNDO, EDITOR_REDO, CLOSE_EDITOR } from 'modules/editor/actions'
import { SceneDefinition } from 'modules/scene/types'
import {
  CreateSceneAction,
  CREATE_SCENE,
  ProvisionSceneAction,
  PROVISION_SCENE,
  UpdateMetricsAction,
  UPDATE_METRICS,
  UpdateTransfromAction
} from 'modules/scene/actions'

export type SceneState = {
  data: ModelById<SceneDefinition>
  loading: LoadingState
  error: string | null
}
export type UndoableSceneState = StateWithHistory<SceneState>

export type SceneReducerAction = CreateSceneAction | ProvisionSceneAction | UpdateMetricsAction | UpdateTransfromAction

const INITIAL_STATE: SceneState = {
  data: {},
  loading: [],
  error: null
}

const baseSceneReducer = (state: SceneState = INITIAL_STATE, action: SceneReducerAction): SceneState => {
  switch (action.type) {
    case CREATE_SCENE: {
      const { scene } = action.payload

      return {
        loading: loadingReducer(state.loading, action),
        error: null,
        data: {
          ...state.data,
          [scene.id]: { ...scene }
        }
      }
    }

    case PROVISION_SCENE: {
      const { sceneId, components, entities } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [sceneId]: {
            ...state.data[sceneId],
            components,
            entities
          }
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
const undoableReducer = undoable<SceneState>(baseSceneReducer as any, {
  limit: 48,
  undoType: EDITOR_UNDO,
  redoType: EDITOR_REDO,
  clearHistoryType: CLOSE_EDITOR,
  filter: includeAction([CREATE_SCENE, PROVISION_SCENE])
})

export const sceneReducer = (state: any, action: any) => {
  const newState = undoableReducer(state, action)
  // This prevents going back to a broken state after creating a new scene
  if (action.type === CREATE_SCENE) {
    newState.past.pop()
  }
  return newState
}
