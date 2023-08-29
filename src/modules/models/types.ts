export type ModelMetrics = {
  triangles: number
  materials: number
  meshes: number
  bodies: number
  entities: number
  textures: number
}

export type AnimationMetrics = {
  sequences: number
  duration: number
  frames: number
  fps: number
  props: number
}

export type Metrics = ModelMetrics | AnimationMetrics

export const areEmoteMetrics = (metrics: Metrics): metrics is AnimationMetrics => !!(metrics as AnimationMetrics).fps

export type Vector3 = { x: number; y: number; z: number }

export type Quaternion = { x: number; y: number; z: number; w: number }
