import { RootState } from 'modules/common/types'
import { ComponentType, ComponentDefinition } from './types'

export const getState = (state: RootState) => state.component

export const getData = (state: RootState) => getState(state).data

export const getGLTFId = (src: string) => (state: RootState) => {
  const componentData = getData(state)

  for (let key in Object.keys(componentData)) {
    const comp = componentData[key] as ComponentDefinition<ComponentType.GLTFShape>
    if (comp.type === ComponentType.GLTFShape && comp.data.src === src) return key
    return null
  }
}
