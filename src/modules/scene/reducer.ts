import undoable, { StateWithHistory, includeAction, ActionTypes } from 'redux-undo'
import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
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
  SyncSceneAssetsSuccessAction,
  UPDATE_SCENE,
  UpdateSceneAction,
  MIGRATE_TO_SDK7_REQUEST,
  MigrateToSDK7RequestAction,
  MigrateToSDK7SuccessAction,
  MigrateToSDK7FailureAction,
  MIGRATE_TO_SDK7_FAILURE,
  MIGRATE_TO_SDK7_SUCCESS
} from 'modules/scene/actions'
import {
  DeleteProjectAction,
  DELETE_PROJECT,
  LoadManifestSuccessAction,
  LOAD_PROJECT_SCENE_SUCCESS,
  LoadProjectSceneSuccessAction
} from 'modules/project/actions'

export type SceneState = {
  data: Record<string, Scene>
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
  | LoadProjectSceneSuccessAction
  | UpdateSceneAction
  | MigrateToSDK7RequestAction
  | MigrateToSDK7SuccessAction
  | MigrateToSDK7FailureAction

const INITIAL_STATE: SceneState = {
  data: {},
  loading: [],
  error: null
}

const baseSceneReducer = (state: SceneState = INITIAL_STATE, action: SceneReducerAction): SceneState => {
  switch (action.type) {
    case CREATE_SCENE:
    case LOAD_PROJECT_SCENE_SUCCESS: {
      const { scene } = action.payload
      if (scene.sdk6) {
        return {
          ...state,
          data: {
            ...state.data,
            [scene.sdk6.id]: {
              ...scene,
              sdk6: { ...scene.sdk6, components: { ...scene.sdk6.components }, entities: { ...scene.sdk6.entities } }
            }
          }
        }
      } else {
        return {
          ...state,
          data: {
            ...state.data,
            [scene.sdk7.id]: { ...scene }
          }
        }
      }
    }
    case UPDATE_SCENE: {
      const { scene } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [scene.id]: {
            ...state.data[scene.id],
            sdk6: null,
            sdk7: {
              ...scene
            }
          }
        }
      }
    }
    case PROVISION_SCENE:
    case FIX_LEGACY_NAMESPACES_SUCCESS:
    case SYNC_SCENE_ASSETS_SUCCESS: {
      const { scene: sceneSdk6 } = action.payload
      const scene = state.data[sceneSdk6.id]
      return {
        ...state,
        data: {
          ...state.data,
          [sceneSdk6.id]: {
            ...scene,
            sdk6: {
              ...sceneSdk6,
              components: { ...sceneSdk6.components },
              entities: { ...sceneSdk6.entities }
            },
            sdk7: null
          }
        }
      }
    }
    case UPDATE_METRICS: {
      const { sceneId, metrics, limits } = action.payload
      const scene = state.data[sceneId]
      if (scene.sdk6) {
        return {
          ...state,
          data: {
            ...state.data,
            [sceneId]: {
              ...scene,
              sdk6: {
                ...scene.sdk6,
                metrics: {
                  ...scene.sdk6.metrics,
                  ...metrics
                },
                limits: {
                  ...scene.sdk6.limits,
                  ...limits,
                  // INCREASE MATERIALS LIMIT FOR TEMPLATES
                  materials: limits.materials * 1.1
                }
              }
            }
          }
        }
      } else {
        return state
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

    case MIGRATE_TO_SDK7_REQUEST:
    case MIGRATE_TO_SDK7_FAILURE:
    case MIGRATE_TO_SDK7_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
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
  clearHistoryType: [OPEN_EDITOR, ActionTypes.CLEAR_HISTORY] as any, // clearHistoryType comes with the wrong typing, tracked here https://github.com/omnidan/redux-undo/issues/222
  filter: includeAction([CREATE_SCENE, PROVISION_SCENE])
})
