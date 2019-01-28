import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { SceneState } from 'modules/scene/reducer'
import { getCurrentProject } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { ComponentDefinition, ComponentType, SceneDefinition, AnyComponent, EntityDefinition } from './types'

export const getState: (state: RootState) => SceneState = state => state.scene.present

export const getData: (state: RootState) => SceneState['data'] = state => getState(state).data

export const getCurrentScene = createSelector<RootState, Project, SceneState['data'], SceneDefinition>(
  getCurrentProject,
  getData,
  (project, scenes) => {
    const sceneId = project.sceneId
    return scenes[sceneId]
  }
)

export const getComponents = createSelector<RootState, SceneDefinition, Record<string, AnyComponent>>(
  getCurrentScene,
  scene => scene.components
)

export const getEntities = createSelector<RootState, SceneDefinition, Record<string, EntityDefinition>>(
  getCurrentScene,
  scene => scene.entities
)

export const getEntityComponents = (entityId: string) =>
  createSelector<RootState, Record<string, EntityDefinition>, Record<string, AnyComponent>, Record<string, AnyComponent>>(
    getEntities,
    getComponents,
    (entities, components) => {
      let out: Record<string, AnyComponent> = {}

      if (entityId && entities) {
        const componentReferences = entities[entityId].components

        for (let componentId of componentReferences) {
          out[componentId] = components[componentId]
        }
      }

      return out
    }
  )

export const getComponentByType = <T extends ComponentType>(type: T) => (state: RootState) => {
  const components = getCurrentScene(state).components
  const out: ComponentDefinition<T>[] = []

  for (let component of Object.values(components)) {
    if (component.type === type) {
      out.push(component as ComponentDefinition<T>)
    }
  }

  return out
}

export const getGLTFId = (src: string) => (state: RootState) => {
  const componentData = getCurrentScene(state).components

  for (let key in componentData) {
    const comp = componentData[key] as ComponentDefinition<ComponentType.GLTFShape>
    if (comp.type === ComponentType.GLTFShape && comp.data.src === src) return key
    return null
  }
}
