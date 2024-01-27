import { Project, Layout, Manifest } from 'modules/project/types'
import { Coordinate, Rotation } from 'modules/deployment/types'
import { NO_CACHE_HEADERS } from 'lib/headers'
import { getDimensions } from 'lib/layout'
import { Scene } from 'modules/scene/types'
import { getContentsStorageUrl } from 'lib/api/builder'
import { Media } from 'modules/media/types'

export function getProjectDimensions(project: Project): string {
  const { rows, cols } = project.layout
  return getDimensions(rows, cols)
}

export function didUpdateLayout(update: Partial<Project>, project: Project): boolean {
  let res = false

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
  const res = await fetch(url, { headers: NO_CACHE_HEADERS })
  const blob = await res.blob()
  // TODO: Fix binary data type in the builder-server
  const imgBlob = new Blob([blob], { type: 'image/png' })

  const out = new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = e => reject(e)
  })

  reader.readAsDataURL(imgBlob)

  return out
}

export async function getTemplates(): Promise<Manifest[]> {
  return (await import('@dcl/builder-templates/templates.json')).templates as unknown as Manifest[]
}

export async function getTemplate(projectId: string) {
  const templates = await getTemplates()
  const template = templates.find(template => template.project.id === projectId)
  if (!template) {
    throw new Error(`Could not find template with projectId="${projectId}"`)
  }
  return template
}

export function getThumbnailUrl(project: Project, scene?: Scene | null, media?: Media | null) {
  let thumbnailUrl = media ? media.preview : project.thumbnail
  if (scene && scene.sdk7?.metadata?.display?.navmapThumbnail) {
    const hash = scene.sdk7.mappings[scene.sdk7?.metadata?.display?.navmapThumbnail]
    if (hash) {
      thumbnailUrl = getContentsStorageUrl(hash)
    }
  }
  return thumbnailUrl
}
