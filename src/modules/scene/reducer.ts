import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { SceneDefinition } from './types'
import { CreateSceneAction, CREATE_SCENE, ADD_REFERENCES, AddReferencesAction } from './actions'

export type SceneReducerAction = CreateSceneAction | AddReferencesAction

export type SceneState = {
  data: Record<string, SceneDefinition>
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: SceneState = {
  data: {
    'test-scene': {
      id: 'test-scene',
      entities: [],
      components: [],
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

export const sceneReducer = (state: SceneState = INITIAL_STATE, action: SceneReducerAction): SceneState => {
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

    case ADD_REFERENCES: {
      const { sceneId, entities, components } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [sceneId]: {
            ...state.data[sceneId],
            entities: [...entities],
            components: [...components]
          }
        }
      }
    }

    default:
      return state
  }
}
