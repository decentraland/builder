export type ModelMetrics = {
  triangles: number
  materials: number
  meshes: number
  bodies: number
  entities: number
  textures: number
}

// TODO import Vector3 and Quaternion from a library ??? There are multiple implementations of it (decentraland-ecs, babylon, three)
export type Vector3 = { x: number; y: number; z: number }

export type Quaternion = { x: number; y: number; z: number; w: number }
