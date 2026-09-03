import { Project, Layout } from 'modules/project/types'
import { Coordinate, Rotation } from 'modules/deployment/types'
import { getDimensions } from 'lib/layout'
import { Scene } from 'modules/scene/types'
import { getContentsStorageUrl } from 'lib/api/builder'

export function getProjectDimensions(project: Project): string {
  const { rows, cols } = project.layout
  return getDimensions(rows, cols)
}

export function getParcelOrientation(layout: Layout, point: Coordinate, rotation: Rotation): Coordinate[] {
  const { rows, cols } = layout
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

export function getThumbnailUrl(project: Project, scene?: Scene | null) {
  let thumbnailUrl = project.thumbnail
  if (scene && scene.sdk7?.metadata?.display?.navmapThumbnail) {
    const hash = scene.sdk7.mappings[scene.sdk7?.metadata?.display?.navmapThumbnail]
    if (hash) {
      thumbnailUrl = getContentsStorageUrl(hash)
    }
  }
  return thumbnailUrl
}
