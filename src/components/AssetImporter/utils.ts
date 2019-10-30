import { cleanAssetName, MAX_NAME_LENGTH } from 'modules/asset/utils'
import { CategoryName } from 'modules/ui/sidebar/utils'
import { ImportedFile } from './AssetImporter.types'
import { SceneMetrics } from 'modules/scene/types'

export const ASSET_MANIFEST = 'asset.json'
export const MAX_FILE_SIZE = 5000000

export const CODE_SEPARATOR = '/*! code */;'
export const SOURCE_MAPS_SEPARATOR = '//# sourceMappingURL'

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
      model: file.name,
      script: null,
      contents: {
        [file.name]: file
      },
      metrics: getMetrics(),
      parameters: [],
      actions: []
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

export async function prepareScript(scriptPath: string, namespace: string, contents: Record<string, Blob>): Promise<Record<string, Blob>> {
  const blob = contents[scriptPath]
  if (blob) {
    let text = await new Response(blob).text()

    // remove ecs and amd loader
    if (text.includes(CODE_SEPARATOR)) {
      text = text.split(CODE_SEPARATOR).pop()!
    }

    // remove source maps
    if (text.includes(SOURCE_MAPS_SEPARATOR)) {
      text = text.split(SOURCE_MAPS_SEPARATOR).shift()! + '")'
    }

    /** Namespace module definitions
     * It converts this:
     * define("myModule", ...
     * Into this:
     * define("namespace/myModule")
     */
    text = text.replace(/define\(\\\"([\w]*)/g, (match, moduleName) => {
      let code = match.slice(0, -moduleName.length) // remove previous module name
      code += `${namespace}/${moduleName}` // add namespaced module name
      return code
    })

    /** Namespace module definitions
     * It converts this:
     * ["require", "exports", "myDependency"]
     * Into this:
     * ["require", "exports", "namespace/myDependency"]
     */
    text = text.replace(/\[\\\"require\\\", \\\"exports\\\", ([\w|\\|\"|,|\s]*)/g, (match, dependencies) => {
      let code = match.slice(0, -dependencies.length) // remove previous dependencies
      const newDependencies = dependencies.replace(/\\\"(.*?)\\\"/g, `\\\"${namespace}/$1\\\"`) // adds the namespace to each dependency
      return code + newDependencies
    })

    /** Namespace mappings
     *  It converts this:
     *  new GLTFShape("models/Door.gltf")
     *  Into this:
     *  new GLTFShape("namespace/models/Door.gltf")
     */
    for (const path of Object.keys(contents)) {
      text = text.replace(new RegExp(path, 'g'), `${namespace}/${path}`)
    }

    contents[scriptPath] = new Blob([text], {
      type: 'text/plain'
    })
  }
  return contents
}
