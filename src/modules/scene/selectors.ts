import { createSelector } from 'reselect'
import { RootState } from 'modules/common/types'
import { SceneState } from 'modules/scene/reducer'
import { getCurrentProject } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { ComponentDefinition, ComponentType, SceneDefinition } from './types'

export const getState: (state: RootState) => SceneState = state => state.scene

export const getData: (state: RootState) => SceneState['data'] = state => getState(state).data

export const getCurrentScene = createSelector<RootState, Project, SceneState['data'], SceneDefinition>(
  getCurrentProject,
  getData,
  (project, scenes) => {
    const sceneId = project.sceneId
    return scenes[sceneId]
  }
)

export const getGLTFId = (src: string) => (state: RootState) => {
  const componentData = getCurrentScene(state).components

  for (let key in Object.keys(componentData)) {
    const comp = componentData[key] as ComponentDefinition<ComponentType.GLTFShape>
    if (comp.type === ComponentType.GLTFShape && comp.data.src === src) return key
    return null
  }
}
