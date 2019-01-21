import undoable, { StateWithHistory } from 'redux-undo'
import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { EDITOR_UNDO, EDITOR_REDO } from 'modules/editor/actions'
import { SceneDefinition } from 'modules/scene/types'
import {
  CreateSceneAction,
  CREATE_SCENE,
  ProvisionSceneAction,
  PROVISION_SCENE,
  UpdateMetricsAction,
  UPDATE_METRICS
} from 'modules/scene/actions'
import { EMPTY_SCENE_METRICS } from './constants'

export type SceneState = {
  data: Record<string, SceneDefinition>
  loading: LoadingState
  error: string | null
}
export type UndoableSceneState = StateWithHistory<SceneState>

export type SceneReducerAction = CreateSceneAction | ProvisionSceneAction | UpdateMetricsAction

const INITIAL_STATE: SceneState = {
  data: {
    'test-scene': {
      id: 'test-scene',
      entities: {},
      components: {},
      metrics: EMPTY_SCENE_METRICS,
      limits: EMPTY_SCENE_METRICS
    }
  },
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
      const currentComponents = { ...state.data[sceneId].components }
      const currentEntities = { ...state.data[sceneId].entities }

      return {
        ...state,
        data: {
          ...state.data,
          [sceneId]: {
            ...state.data[sceneId],
            components: components.reduce((acc, components) => ({ ...acc, [components.id]: { ...components } }), currentComponents),
            entities: entities.reduce((acc, entity) => ({ ...acc, [entity.id]: { ...entity } }), currentEntities)
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
export const sceneReducer = undoable<SceneState>(baseSceneReducer as any, {
  limit: 48,
  undoType: EDITOR_UNDO,
  redoType: EDITOR_REDO
})
