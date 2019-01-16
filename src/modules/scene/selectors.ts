import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { SceneState } from 'modules/scene/reducer'
import { getCurrentProject } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { ComponentDefinition, ComponentType, SceneDefinition, AnyComponent } from './types'

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
