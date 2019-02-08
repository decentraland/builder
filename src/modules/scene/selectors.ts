import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { SceneState } from 'modules/scene/reducer'
import { getCurrentProject } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { ComponentDefinition, ComponentType, SceneDefinition, AnyComponent } from './types'

export const getState: (state: RootState) => SceneState = state => state.scene.present

export const getData: (state: RootState) => SceneState['data'] = state => getState(state).data

export const getCurrentScene = createSelector<RootState, Project | null, SceneState['data'], SceneDefinition | null>(
  getCurrentProject,
  getData,
  (project, scenes) => {
    if (!project) return null
    const sceneId = project.sceneId
    return scenes[sceneId]
  }
)

export const getComponents = createSelector<RootState, SceneDefinition | null, SceneDefinition['components']>(
  getCurrentScene,
  scene => (scene ? scene.components : {})
)

export const getEntities = createSelector<RootState, SceneDefinition | null, SceneDefinition['entities']>(
  getCurrentScene,
  scene => (scene ? scene.entities : {})
)

export const getEntityComponents = (entityId: string) =>
  createSelector<RootState, SceneDefinition['entities'], SceneDefinition['components'], Record<string, AnyComponent>>(
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

export const getEntityComponentByType = <T extends ComponentType>(entityId: string, type: T) =>
  createSelector<RootState, SceneDefinition['entities'], SceneDefinition['components'], ComponentDefinition<T> | null>(
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

export const getComponentByType = <T extends ComponentType>(type: T) => (state: RootState) => {
  const scene = getCurrentScene(state)
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

export const hasHistory = (state: RootState) => state.scene.past.length > 0
