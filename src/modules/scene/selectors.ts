import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { SceneState } from 'modules/scene/reducer'
import { getCurrentProject } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { getData as getAssets } from 'modules/asset/selectors'
import { ComponentDefinition, ComponentType, Scene, AnyComponent, SceneMetrics, ShapeComponent, EntityDefinition } from './types'
import { EMPTY_SCENE_METRICS, ShapeComponents } from './constants'
import { Asset } from 'modules/asset/types'
import { AssetState } from 'modules/asset/reducer'

export const getState: (state: RootState) => SceneState = state => state.scene.present

export const getData: (state: RootState) => SceneState['data'] = state => getState(state).data

export const getCurrentScene = createSelector<RootState, Project | null, SceneState['data'], Scene | null>(
  getCurrentProject,
  getData,
  (project, scenes) => (project ? scenes[project.sceneId] : null)
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

export const getComponentsByEntityId = createSelector<RootState, Scene['entities'], Scene['components'], Record<string, AnyComponent[]>>(
  getEntities,
  getComponents,
  (entities, components) => {
    let out: Record<string, AnyComponent[]> = {}

    for (let entityId in entities) {
      if (entityId && entities && entityId in entities) {
        const componentReferences = entities[entityId].components

        for (let componentId of componentReferences) {
          if (!out[entityId]) {
            out[entityId] = []
          }

          out[entityId].push(components[componentId])
        }
      }
    }

    return out
  }
)

export const getEntityComponentsByType = createSelector<
  RootState,
  Scene['entities'],
  Scene['components'],
  Record<string, Record<ComponentType, AnyComponent>>
>(
  getEntities,
  getComponents,
  (entities, components) => {
    const out: Record<string, Record<ComponentType, AnyComponent>> = {}

    for (let entityId in entities) {
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
  }
)

export const getShapesByEntityId = createSelector<RootState, Scene['entities'], Scene['components'], Record<string, ShapeComponent>>(
  getEntities,
  getComponents,
  (entities, components) => {
    const out: Record<string, ShapeComponent> = {}

    for (let entityId in entities) {
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
  }
)

export const getComponentsByType = createSelector<RootState, Scene | null, Record<ComponentType, AnyComponent[]>>(
  getCurrentScene,
  scene => {
    const out: Record<ComponentType, AnyComponent[]> = {} as Record<ComponentType, AnyComponent[]>

    for (const key of Object.keys(ComponentType)) {
      out[key as ComponentType] = []
    }

    if (scene) {
      const components = scene.components
      for (let component of Object.values(components)) {
        if (!out[component.type]) {
          out[component.type] = []
        }
        out[component.type].push(component)
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
export const numItems = createSelector<RootState, Project | null, Scene | null, number>(
  getCurrentProject,
  getCurrentScene,
  (project, scene) => {
    if (!project || !scene) return 0
    const numTransforms = Object.values(scene.components).reduce<number>(
      (total, component) => (component.type === ComponentType.Transform ? total + 1 : total),
      0
    )
    const numGrounds = project.layout.cols * project.layout.rows
    return numTransforms - numGrounds
  }
)

export const getAssetsWithScriptByEntityName = createSelector<
  RootState,
  Record<string, EntityDefinition>,
  Record<string, AnyComponent[]>,
  AssetState['data'],
  Record<string, Asset>
>(
  getEntities,
  getComponentsByEntityId,
  getAssets,
  (entities, componentsByEntity, assets) => {
    const out: Record<string, Asset> = {}
    for (let entityId in componentsByEntity) {
      const components = componentsByEntity[entityId]
      for (let component of components) {
        if (component.type === ComponentType.Script) {
          const asset = assets[(component as ComponentDefinition<ComponentType.Script>).data.assetId]
          if (asset.actions.length > 0) {
            out[entities[entityId].name] = asset
          }
        }
      }
    }
    return out
  }
)
