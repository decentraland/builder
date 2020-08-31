import { ModelMetrics, ComponentType } from './types'

export const EMPTY_SCENE_METRICS: ModelMetrics = {
  triangles: 0,
  materials: 0,
  meshes: 0,
  bodies: 0,
  entities: 0,
  textures: 0
}

export const ShapeComponents = [ComponentType.GLTFShape, ComponentType.NFTShape]
