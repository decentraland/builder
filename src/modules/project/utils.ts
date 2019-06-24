import { Project, Layout, Coordinate, Rotation } from 'modules/project/types'
import { getDimensions } from 'lib/layout'

export const MIN_TITLE_LENGTH = 3 // Size in chars
export const MAX_TITLE_LENGTH = 40 // Size in chars
export const MIN_DESCRIPTION_LENGTH = 0 // Size in chars
export const MAX_DESCRIPTION_LENGTH = 140 // Size in chars
export const PARCEL_SIZE = 16 // Side size in meters

export function getProjectDimensions(project: Project): string {
  const { rows, cols } = project.layout
  return getDimensions(rows, cols)
}

export function getBlockchainParcelsFromLayout(layout: Layout) {
  let out = []
  for (let y = 0; y < layout.cols; y++) {
    for (let x = 0; x < layout.rows; x++) {
      out.push({ x, y })
    }
  }
  return out
}

export function isEqualLayout(left: Layout, right: Layout) {
  return left.cols === right.cols && left.rows === right.rows
}

export function getParcelOrientation(project: Project, point: Coordinate, rotation: Rotation): Coordinate[] {
  const { rows, cols } = project.layout
  const parcels: Coordinate[] = []

  switch (rotation) {
    case 'north': {
      for (let x = point.x; x < point.x + cols; x++) {
        for (let y = point.y; y < point.y + rows; y++) {
          const parcel = { x, y }
          parcels.push(parcel)
        }
      }
      break
    }
    case 'east': {
      for (let x = point.x; x < point.x + rows; x++) {
        for (let y = point.y; y < point.y + cols; y++) {
          parcels.push({ x, y })
        }
      }
      break
    }
    case 'south': {
      for (let x = point.x; x > point.x - cols; x--) {
        for (let y = point.y; y > point.y - rows; y--) {
          parcels.push({ x, y })
        }
      }
      break
    }
    case 'west': {
      for (let x = point.x; x > point.x - rows; x--) {
        for (let y = point.y; y > point.y - cols; y--) {
          parcels.push({ x, y })
        }
      }
      break
    }
  }

  return parcels
}
