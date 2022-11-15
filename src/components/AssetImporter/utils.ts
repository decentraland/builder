import { cleanAssetName } from 'modules/asset/utils'
import { CategoryName } from 'modules/ui/sidebar/utils'
import { ImportedFile } from './AssetImporter.types'
import { ModelMetrics } from 'modules/models/types'
import { buildAssetPath } from 'modules/project/export'

export const ASSET_MANIFEST = 'asset.json'

/* 
  This RegEx searches for the beginning of the smart item's bundle, it's a comment that contains '! "src/game.ts" <commit-hash>'
  We split the code and take everything that comes AFTER this comment
*/
export const CODE_SEPARATOR = /\/\*! "src(\/|\\)([A-z0-9|/|\\|\-|_])*\.ts" [a-f0-9]+ \*\//

/* 
  This separator searches for the end of the smart item's bundle, before the source maps start.
  We split the code and take everything that comes BEFORE this comment
*/
export const SOURCE_MAPS_SEPARATOR = '//# sourceMappingURL'

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

export function getMetrics(): ModelMetrics {
  return {
    triangles: 0,
    materials: 0,
    meshes: 0,
    bodies: 0,
    entities: 0,
    textures: 0
  }
}

export async function prepareScript(scriptPath: string, namespace: string, contents: Record<string, Blob>): Promise<Record<string, Blob>> {
  const blob = contents[scriptPath]
  if (blob) {
    let text = await new Response(blob).text()

    // remove ecs and amd loader
    if (CODE_SEPARATOR.test(text)) {
      text = text.split(CODE_SEPARATOR).pop()!
    }

    // remove source maps
    if (text.includes(SOURCE_MAPS_SEPARATOR)) {
      const padding = text.trim().endsWith(';') ? 3 : 2
      const parts = text.trim().slice(0, -padding).split(SOURCE_MAPS_SEPARATOR)
      text = parts.shift()! + text.slice(-padding)
    }

    /** Namespace module definitions
     * It converts this:
     * define("myModule", ...
     * Into this:
     * define("namespace/myModule")
     */
    text = text.replace(/define\(\\?"([\w]*)/g, (match, moduleName: string) => {
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
    text = text.replace(/\[\\?"require\\?", \\?"exports\\?", ([\w|\\|/|"|,|\s|@]*)/g, (match, dependencies) => {
      const code = match.slice(0, -dependencies.length) // remove previous dependencies
      const newDependencies: string = dependencies.replace(/\\?"(\w.*?)\\?"/g, `\\"${namespace}/$1\\"`) // adds the namespace to each dependency
      return `${code}${newDependencies}`
    })

    /** Namespace mappings
     *  It converts this:
     *  new GLTFShape("path/to/model.gltf")
     *  Into this:
     *  new GLTFShape("assets/:namespace/path/to/model.gltf")
     */
    for (const path of Object.keys(contents)) {
      text = text.replace(new RegExp(path, 'g'), buildAssetPath(namespace, path))
    }

    // Remove extra src/
    text = text.replace(/src(\/|\\)/g, '')

    contents[scriptPath] = new Blob([text], {
      type: 'text/plain'
    })
  }
  return contents
}
