import { Vector3, Quaternion } from 'modules/common/types'
import { Asset, AssetParameterValues } from 'modules/asset/types'

export type EntityDefinition = {
  id: string
  components: string[] // array of IDs pointing to components
  disableGizmos?: boolean
  name: string
}

export enum ComponentType {
  GLTFShape = 'GLTFShape',
  Transform = 'Transform',
  NFTShape = 'NFTShape',
  Script = 'Script'
}

export type ComponentData = {
  [ComponentType.GLTFShape]: {
    assetId: string
    src: string
  }

  [ComponentType.Transform]: {
    position: Vector3
    rotation: Quaternion
    scale: Vector3
  }
  [ComponentType.NFTShape]: {
    url: string
  }
  [ComponentType.Script]: {
    assetId: string
    src: string
    values: AssetParameterValues
  }
}

export type AnyComponent = ComponentDefinition<ComponentType>

export type ShapeComponent = ComponentDefinition<ComponentType.GLTFShape | ComponentType.NFTShape>

export type ComponentDefinition<T extends ComponentType> = {
  id: string
  type: T
  data: ComponentData[T]
}

export type SceneMetrics = {
  triangles: number
  materials: number
  meshes: number
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
  assets: Record<string, Asset>
  ground: {
    // id references
    assetId: string
    componentId: string
  } | null
}
