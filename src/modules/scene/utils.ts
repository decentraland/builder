import { Vector3 } from 'modules/common/types'
import { Scene } from './types'

/**
 * Returns a new random position bound to y: 0
 * Can be overriden using the position argument
 */
export function getRandomPosition(position: Partial<Vector3> = {}) {
  const x = Math.floor(Math.random() * 6) + 1
  const z = Math.floor(Math.random() * 6) + 1
  return { x, y: 0, z, ...position }
}

export function getRandomPositionWithinBounds(bounds: Vector3) {
  const x = Math.random() * bounds.x
  const y = Math.random() * bounds.y
  const z = Math.random() * bounds.z
  return { x, y, z }
}

export function isWithinBounds(position: Vector3, bounds: Vector3) {
  return position.x <= bounds.x && position.y <= bounds.y && position.z <= bounds.z && position.x >= 0 && position.y >= 0 && position.z >= 0
}

// Note: if we start making extensive use of scene cloning we may replace this by a proper deep clone
export function cloneEntities(scene: Scene) {
  return Object.keys(scene.entities).reduce<Scene['entities']>(
    (entities, entityId) => ({
      ...entities,
      [entityId]: { ...scene.entities[entityId], components: [...scene.entities[entityId].components] }
    }),
    {}
  )
}

export function clearGround(groundId: string, entities: Scene['entities']): Scene['entities'] {
  const newEntities: Scene['entities'] = {}

  for (let id in entities) {
    const entity = entities[id]
    const index = entity.components.indexOf(groundId)

    if (index === -1) {
      newEntities[id] = entity
    }
  }

  return newEntities
}

export function snapToGrid(position: Vector3, grid: number = 0.5): Vector3 {
  return {
    x: Math.round(position.x / grid) * grid,
    y: Math.round(position.y / grid) * grid,
    z: Math.round(position.z / grid) * grid
  }
}

export function snapToBounds(position: Vector3, bounds: Vector3): Vector3 {
  return {
    x: Math.max(Math.min(position.x, bounds.x), 0),
    y: Math.max(Math.min(position.y, bounds.y), 0),
    z: Math.max(Math.min(position.z, bounds.z), 0)
  }
}
