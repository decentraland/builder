import { Project, Layout } from 'modules/project/types'
import { Coordinate, Rotation } from 'modules/deployment/types'
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

export function didUpdateLayout(update: Partial<Project>, project: Project): boolean {
  let res: boolean = false

  if (update.layout && project.layout) {
    if (update.layout.rows && update.layout.rows !== project.layout.rows) {
      res = true
    }

    if (update.layout.cols && update.layout.cols !== project.layout.cols) {
      res = true
    }
  }

  return res
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

export async function getImageAsDataUrl(url: string): Promise<string> {
  const reader = new FileReader()
  const res = await fetch(url)
  const blob = await res.blob()

  const out = new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = e => reject(e)
  })

  reader.readAsDataURL(blob)

  return out
}
