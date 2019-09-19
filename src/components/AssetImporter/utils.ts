import { cleanAssetName, MAX_NAME_LENGTH } from 'modules/asset/utils'
import { CategoryName } from 'modules/ui/sidebar/utils'
import { ImportedFile } from './AssetImporter.types'
import { SceneMetrics } from 'modules/scene/types'

export const ASSET_MANIFEST = 'asset.json'
export const MAX_FILE_SIZE = 5000000

export function getExtension(fileName: string) {
  const matches = fileName.match(/\.[0-9a-z]+$/i)
  const extension = matches ? matches[0] : null
  return extension
}

export function createDefaultImportedFile(id: string, assetPackId: string, file: File): ImportedFile {
  return {
    id,
    fileName: file.name,
    asset: {
      id,
      assetPackId,
      thumbnail: '',
      tags: [],
      name: cleanAssetName(file.name),
      category: CategoryName.DECORATIONS_CATEGORY,
      url: file.name,
      contents: {
        [file.name]: file
      },
      metrics: getMetrics()
    }
  }
}

export function getMetrics(): SceneMetrics {
  return {
    triangles: 0,
    materials: 0,
    meshes: 0,
    bodies: 0,
    entities: 0,
    textures: 0
  }
}

export function truncateFileName(name: string) {
  if (name.length <= MAX_NAME_LENGTH) return name
  const firstPart = name.substr(0, 4)
  const secondPart = name.substr(name.length - 5, name.length)
  return `${firstPart}...${secondPart}`
}
