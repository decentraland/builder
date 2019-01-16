import undoable, { StateWithHistory } from 'redux-undo'
import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { EDITOR_UNDO, EDITOR_REDO } from 'modules/editor/actions'
import { SceneDefinition } from './types'
import { CreateSceneAction, CREATE_SCENE, ProvisionSceneAction, PROVISION_SCENE } from './actions'

export type SceneState = {
  data: Record<string, SceneDefinition>
  loading: LoadingState
  error: string | null
}
export type UndoableSceneState = StateWithHistory<SceneState>

export type SceneReducerAction = CreateSceneAction | ProvisionSceneAction

const INITIAL_STATE: SceneState = {
  data: {
    'test-scene': {
      id: 'test-scene',
      entities: {},
      components: {},
      metrics: {
        entities: 0,
        bodies: 0,
        materials: 0,
        height: 0,
        textures: 0,
        triangles: 0
      }
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

      return {
        ...state,
        data: {
          ...state.data,
          [sceneId]: {
            ...state.data[sceneId],
            components: components.reduce((acc, components) => ({ ...acc, [components.id]: { ...components } }), {
              ...state.data[sceneId].components
            }),
            entities: entities.reduce((acc, entity) => ({ ...acc, [entity.id]: { ...entity } }), { ...state.data[sceneId].entities })
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
