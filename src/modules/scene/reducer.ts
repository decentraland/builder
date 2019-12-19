import undoable, { StateWithHistory, includeAction, ActionTypes } from 'redux-undo'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { EDITOR_UNDO, EDITOR_REDO, OPEN_EDITOR } from 'modules/editor/actions'
import { Scene } from 'modules/scene/types'
import {
  ProvisionSceneAction,
  PROVISION_SCENE,
  UpdateMetricsAction,
  UPDATE_METRICS,
  CREATE_SCENE,
  CreateSceneAction,
  FixLegacyNamespacesSuccessAction,
  FIX_LEGACY_NAMESPACES_SUCCESS,
  SYNC_SCENE_ASSETS_SUCCESS,
  SyncSceneAssetsSuccessAction
} from 'modules/scene/actions'
import { DeleteProjectAction, DELETE_PROJECT, LoadManifestSuccessAction } from 'modules/project/actions'

export type SceneState = {
  data: ModelById<Scene>
  loading: LoadingState
  error: string | null
}
export type UndoableSceneState = StateWithHistory<SceneState>

export type SceneReducerAction =
  | ProvisionSceneAction
  | UpdateMetricsAction
  | CreateSceneAction
  | DeleteProjectAction
  | LoadManifestSuccessAction
  | FixLegacyNamespacesSuccessAction
  | SyncSceneAssetsSuccessAction

const INITIAL_STATE: SceneState = {
  data: {},
  loading: [],
  error: null
}

const baseSceneReducer = (state: SceneState = INITIAL_STATE, action: SceneReducerAction): SceneState => {
  switch (action.type) {
    case CREATE_SCENE:
    case PROVISION_SCENE:
    case FIX_LEGACY_NAMESPACES_SUCCESS:
    case SYNC_SCENE_ASSETS_SUCCESS: {
      const { scene } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [scene.id]: { ...scene, components: { ...scene.components }, entities: { ...scene.entities } }
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
    case DELETE_PROJECT: {
      const { project } = action.payload
      const newState = {
        ...state,
        data: {
          ...state.data
        }
      }
      delete newState.data[project.sceneId]
      return newState
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
  clearHistoryType: [OPEN_EDITOR, ActionTypes.CLEAR_HISTORY] as any, // clearHistoryType comes with the wrong typing, tracked here https://github.com/omnidan/redux-undo/issues/222
  filter: includeAction([CREATE_SCENE, PROVISION_SCENE])
})
