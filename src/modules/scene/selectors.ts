import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { SceneState } from 'modules/scene/reducer'
import { getCurrentProject } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { ComponentDefinition, ComponentType, Scene, AnyComponent, SceneMetrics } from './types'
import { EMPTY_SCENE_METRICS, ShapeComponents } from './constants'

export const getState: (state: RootState) => SceneState = state => state.scene.present

export const getData: (state: RootState) => SceneState['data'] = state => getState(state).data

export const getCurrentScene = createSelector<RootState, Project | null, SceneState['data'], Scene | null>(
  getCurrentProject,
  getData,
  (project, scenes) => (project ? scenes[project.sceneId] : null)
)

export const getSceneById = (sceneId: string) =>
  createSelector<RootState, SceneState['data'], Scene | null>(
    getData,
    scenes => scenes[sceneId]
  )

export const getCurrentMetrics = createSelector<RootState, Scene | null, SceneMetrics>(
  getCurrentScene,
  scene => (scene ? scene.metrics : EMPTY_SCENE_METRICS)
)

export const getCurrentLimits = createSelector<RootState, Scene | null, SceneMetrics>(
  getCurrentScene,
  scene => (scene ? scene.limits : EMPTY_SCENE_METRICS)
)

export const getScene = (sceneId: string) => (state: RootState): Scene | null => getData(state)[sceneId] || null

export const getComponents = createSelector<RootState, Scene | null, Scene['components']>(
  getCurrentScene,
  scene => (scene ? scene.components : {})
)

export const getEntities = createSelector<RootState, Scene | null, Scene['entities']>(
  getCurrentScene,
  scene => (scene ? scene.entities : {})
)

export const getEntityComponents = (entityId: string) =>
  createSelector<RootState, Scene['entities'], Scene['components'], Record<string, AnyComponent>>(
    getEntities,
    getComponents,
    (entities, components) => {
      let out: Record<string, AnyComponent> = {}

      if (entityId && entities && entityId in entities) {
        const componentReferences = entities[entityId].components

        for (let componentId of componentReferences) {
          out[componentId] = components[componentId]
        }
      }

      return out
    }
  )

export const getEntityComponentByType = <T extends ComponentType>(entityId: string | null, type: T) =>
  createSelector<RootState, Scene['entities'], Scene['components'], ComponentDefinition<T> | null>(
    getEntities,
    getComponents,
    (entities, components) => {
      if (entityId && entities && entityId in entities) {
        const componentReferences = entities[entityId].components
        for (const componentId of componentReferences) {
          if (components && componentId in components && components[componentId].type === type) {
            return components[componentId] as ComponentDefinition<T>
          }
        }
      }
      return null
    }
  )

export const getEntityShape = <T extends ComponentType>(entityId: string) =>
  createSelector<RootState, Scene['entities'], Scene['components'], ComponentDefinition<T> | null>(
    getEntities,
    getComponents,
    (entities, components) => {
      if (entityId && entities && entityId in entities) {
        const componentReferences = entities[entityId].components
        for (const componentId of componentReferences) {
          if (components && componentId in components && ShapeComponents.includes(components[componentId].type)) {
            return components[componentId] as ComponentDefinition<T>
          }
        }
      }
      return null
    }
  )

export const getComponentsByType = <T extends ComponentType>(type: T) =>
  createSelector<RootState, Scene | null, ComponentDefinition<T>[]>(
    getCurrentScene,
    scene => {
      if (!scene) return []

      const components = scene.components
      const out: ComponentDefinition<T>[] = []

      for (let component of Object.values(components)) {
        if (component.type === type) {
          out.push(component as ComponentDefinition<T>)
        }
      }

      return out
    }
  )

export const getGLTFId = (src: string) => (state: RootState) => {
  const scene = getCurrentScene(state)
  if (!scene) return null

  const componentData = scene.components

  for (let key in componentData) {
    const comp = componentData[key] as ComponentDefinition<ComponentType.GLTFShape>
    if (comp.type === ComponentType.GLTFShape && comp.data.src === src) return key
  }

  return null
}

export const getCollectibleId = (url: string) => (state: RootState) => {
  const scene = getCurrentScene(state)
  if (!scene) return null

  const componentData = scene.components

  for (let key in componentData) {
    const comp = componentData[key] as ComponentDefinition<ComponentType.NFTShape>
    if (comp.type === ComponentType.NFTShape && comp.data.url === url) return key
  }

  return null
}

export const hasHistory = (state: RootState) => state.scene.past.length > 0
