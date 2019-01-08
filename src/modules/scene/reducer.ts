import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { SceneDefinition } from './types'
import { CreateSceneAction, CREATE_SCENE, AddEntityAction, AddComponentAction, ADD_ENTITY, ADD_COMPONENT } from './actions'

export type SceneReducerAction = CreateSceneAction | AddEntityAction | AddComponentAction

export type SceneState = {
  data: Record<string, SceneDefinition>
  loading: LoadingState
  error: string | null
}

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

    case ADD_ENTITY: {
      const { sceneId, entity } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [sceneId]: {
            ...state.data[sceneId],
            entities: { ...state.data[sceneId].entities, [entity.id]: { ...entity } }
          }
        }
      }
    }

    case ADD_COMPONENT: {
      const { sceneId, component } = action.payload

      return {
        ...state,
        data: {
          ...state.data,
          [sceneId]: {
            ...state.data[sceneId],
            components: { ...state.data[sceneId].components, [component.id]: { ...component } }
          }
        }
      }
    }

    default:
      return state
  }
}
