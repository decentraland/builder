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

export const getScene = (sceneId: string) =>
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

export const getGLTFsBySrc = createSelector<RootState, Scene | null, Record<string, ComponentDefinition<ComponentType.GLTFShape>>>(
  getCurrentScene,
  scene => {
    if (!scene) return {}

    const componentData = scene.components
    let res: Record<string, ComponentDefinition<ComponentType.GLTFShape>> = {}

    for (let key in componentData) {
      const comp = componentData[key] as ComponentDefinition<ComponentType.GLTFShape>
      if (comp.type === ComponentType.GLTFShape) {
        res[comp.data.src] = comp
      }
    }

    return res
  }
)

export const getCollectiblesByURL = createSelector<RootState, Scene | null, Record<string, ComponentDefinition<ComponentType.NFTShape>>>(
  getCurrentScene,
  scene => {
    if (!scene) return {}

    const componentData = scene.components
    let res: Record<string, ComponentDefinition<ComponentType.NFTShape>> = {}

    for (let key in componentData) {
      const comp = componentData[key] as ComponentDefinition<ComponentType.NFTShape>
      if (comp.type === ComponentType.NFTShape) {
        res[comp.data.url] = comp
      }
    }

    return res
  }
)

export const hasHistory = (state: RootState) => state.scene.past.length > 0
