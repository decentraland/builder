import { Vector3 } from 'modules/common/types'

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
