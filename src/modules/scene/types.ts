export type EntityDefinition = {
  id: string
  components: string[] // array of IDs pointing to components
  // TODO: handle children?
}

import { Vector3 } from 'modules/common/types'

export enum ComponentType {
  GLTFShape = 'GLTFShape',
  Transform = 'Transform'
}

export type ComponentData = {
  [ComponentType.GLTFShape]: {
    src: string
  }

  [ComponentType.Transform]: {
    position: Vector3
    rotation: Vector3
  }
}

export type AnyComponent = ComponentDefinition<ComponentType>

export type ComponentDefinition<T extends ComponentType> = {
  id: string
  type: T
  data: ComponentData[T]
}

export type SceneDefinition = {
  id: string
  metrics: {
    triangles: number
    materials: number
    bodies: number
    entities: number
    textures: number
    height: number
  }
  entities: Record<string, EntityDefinition>
  components: Record<string, AnyComponent>
}
