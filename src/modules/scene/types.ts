import { Vector3, Quaternion } from 'modules/common/types'

export type EntityDefinition = {
  id: string
  components: string[] // array of IDs pointing to components
  disableGizmos?: boolean

  // TODO: handle children?
}

export enum ComponentType {
  GLTFShape = 'GLTFShape',
  Transform = 'Transform',
  NFTShape = 'NFTShape'
}

export type ComponentData = {
  [ComponentType.GLTFShape]: {
    src: string
  }

  [ComponentType.Transform]: {
    position: Vector3
    rotation: Quaternion
  }
  [ComponentType.NFTShape]: {
    url: string
  }
}

export type AnyComponent = ComponentDefinition<ComponentType>

export type ComponentDefinition<T extends ComponentType> = {
  id: string
  type: T
  data: ComponentData[T]
}

export type SceneMetrics = {
  triangles: number
  materials: number
  geometries: number
  bodies: number
  entities: number
  textures: number
}

export type Scene = {
  id: string
  metrics: SceneMetrics
  limits: SceneMetrics
  entities: Record<string, EntityDefinition>
  components: Record<string, AnyComponent>
  ground: {
    // id references
    assetId: string
    componentId: string
  } | null
}
