import { cleanAssetName } from 'modules/asset/utils'
import { CategoryName } from 'modules/ui/sidebar/utils'
import { ImportedFile } from './AssetImporter.types'

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
      metadata: getDefaultMetadata()
    }
  }
}

export function getDefaultMetadata() {
  return {
    metrics: {
      triangles: 0,
      materials: 0,
      geometries: 0,
      bodies: 0,
      entities: 0,
      textures: 0
    }
  }
}
