import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { SceneState } from 'modules/scene/reducer'
import { getCurrentProject } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { ModelMetrics } from 'modules/models/types'
import { ComponentDefinition, ComponentType, Scene, AnyComponent, ShapeComponent, SceneSDK6 } from './types'
import { EMPTY_SCENE_METRICS, ShapeComponents } from './constants'

export const getState: (state: RootState) => SceneState = state => state.scene.present

export const getData: (state: RootState) => SceneState['data'] = state => getState(state).data

export const getIsLoading: (state: RootState) => boolean = state => !!getState(state).loading.length

export const getLoading: (state: RootState) => SceneState['loading'] = state => getState(state).loading

export const getCurrentScene = createSelector<RootState, Project | null, SceneState['data'], Scene | null>(
  getCurrentProject,
  getData,
  (project, scenes) => (project ? scenes[project.sceneId] : null)
)

export const getCurrentMetrics = createSelector<RootState, Scene | null, ModelMetrics>(getCurrentScene, scene =>
  scene && scene.sdk6 ? scene.sdk6.metrics : EMPTY_SCENE_METRICS
)

export const getCurrentLimits = createSelector<RootState, Scene | null, ModelMetrics>(getCurrentScene, scene =>
  scene && scene.sdk6 ? scene.sdk6.limits : EMPTY_SCENE_METRICS
)

export const getComponents = createSelector<RootState, Scene | null, SceneSDK6['components']>(getCurrentScene, scene =>
  scene && scene.sdk6 ? scene.sdk6.components : {}
)

export const getEntities = createSelector<RootState, Scene | null, SceneSDK6['entities']>(getCurrentScene, scene =>
  scene && scene.sdk6 ? scene.sdk6.entities : {}
)

export const getEntityNames = createSelector<RootState, Scene | null, string[]>(getCurrentScene, scene =>
  scene && scene.sdk6 ? Object.values(scene.sdk6.entities).map(entity => entity.name) : []
)

export const getComponentsByEntityId = createSelector<
  RootState,
  SceneSDK6['entities'],
  SceneSDK6['components'],
  Record<string, AnyComponent[]>
>(getEntities, getComponents, (entities, components) => {
  const out: Record<string, AnyComponent[]> = {}

  for (const entityId in entities) {
    if (entityId && entities && entityId in entities) {
      const componentReferences = entities[entityId].components

      for (const componentId of componentReferences) {
        if (!out[entityId]) {
          out[entityId] = []
        }

        out[entityId].push(components[componentId])
      }
    }
  }

  return out
})

export const getEntityComponentsByType = createSelector<
  RootState,
  SceneSDK6['entities'],
  SceneSDK6['components'],
  Record<string, Record<ComponentType, AnyComponent>>
>(getEntities, getComponents, (entities, components) => {
  const out: Record<string, Record<ComponentType, AnyComponent>> = {}

  for (const entityId in entities) {
    if (entities && entityId in entities) {
      const componentReferences = entities[entityId].components
      for (const componentId of componentReferences) {
        const component = components[componentId]
        if (!out[entityId]) {
          out[entityId] = {} as Record<ComponentType, AnyComponent>
        }
        out[entityId][component.type] = component
      }
    }
  }

  return out
})

export const getShapesByEntityId = createSelector<
  RootState,
  SceneSDK6['entities'],
  SceneSDK6['components'],
  Record<string, ShapeComponent>
>(getEntities, getComponents, (entities, components) => {
  const out: Record<string, ShapeComponent> = {}

  for (const entityId in entities) {
    if (entityId && entities && entityId in entities) {
      const componentReferences = entities[entityId].components
      for (const componentId of componentReferences) {
        if (components && componentId in components && ShapeComponents.includes(components[componentId].type)) {
          out[entityId] = components[componentId] as ShapeComponent
        }
      }
    }
  }

  return out
})

export const getComponentsByType = createSelector<RootState, Scene | null, Record<ComponentType, AnyComponent[]>>(
  getCurrentScene,
  scene => {
    const out: Record<ComponentType, AnyComponent[]> = {} as Record<ComponentType, AnyComponent[]>

    for (const key of Object.keys(ComponentType)) {
      out[key as ComponentType] = []
    }

    if (scene && scene.sdk6) {
      const components = scene.sdk6.components
      for (const component of Object.values(components)) {
        if (!out[component.type]) {
          out[component.type] = []
        }
        out[component.type].push(component)
      }
    }

    return out
  }
)

export const getGLTFsByAssetId = createSelector<RootState, Scene | null, Record<string, ComponentDefinition<ComponentType.GLTFShape>>>(
  getCurrentScene,
  scene => {
    if (!scene || !scene.sdk6) return {}

    const componentData = scene.sdk6.components
    const res: Record<string, ComponentDefinition<ComponentType.GLTFShape>> = {}

    for (const key in componentData) {
      const comp = componentData[key] as ComponentDefinition<ComponentType.GLTFShape>
      if (comp.type === ComponentType.GLTFShape) {
        res[comp.data.assetId] = comp
      }
    }

    return res
  }
)

export const getCollectiblesByURL = createSelector<RootState, Scene | null, Record<string, ComponentDefinition<ComponentType.NFTShape>>>(
  getCurrentScene,
  scene => {
    if (!scene || !scene.sdk6) return {}

    const componentData = scene.sdk6.components
    const res: Record<string, ComponentDefinition<ComponentType.NFTShape>> = {}

    for (const key in componentData) {
      const comp = componentData[key] as ComponentDefinition<ComponentType.NFTShape>
      if (comp.type === ComponentType.NFTShape) {
        res[comp.data.url] = comp
      }
    }

    return res
  }
)

export const hasHistory = (state: RootState) => state.scene.past.length > 0
export const numItems = createSelector<RootState, Project | null, Scene | null, number>(
  getCurrentProject,
  getCurrentScene,
  (project, scene) => {
    if (!project || !scene || !scene.sdk6) return 0
    const numTransforms = Object.values(scene.sdk6.components).reduce<number>(
      (total, component) => (component.type === ComponentType.Transform ? total + 1 : total),
      0
    )
    const numGrounds = project.layout.cols * project.layout.rows
    return numTransforms - numGrounds
  }
)
