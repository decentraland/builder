import { ComponentType } from './types'
import { ModelMetrics } from 'modules/models/types'

export const EMPTY_SCENE_METRICS: ModelMetrics = {
  triangles: 0,
  materials: 0,
  meshes: 0,
  bodies: 0,
  entities: 0,
  textures: 0
}

export const DEFAULT_SCENE_LIMITS: ModelMetrics = {
  triangles: 10000,
  materials: 20,
  meshes: 200,
  bodies: 300,
  entities: 200,
  textures: 10
}

export const ShapeComponents = [ComponentType.GLTFShape, ComponentType.NFTShape]
