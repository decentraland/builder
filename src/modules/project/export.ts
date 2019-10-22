// @ts-ignore
import Dockerfile from '!raw-loader!decentraland/dist/samples/ecs/Dockerfile'
import * as ECS from 'decentraland-ecs'
import { SceneWriter, LightweightWriter } from 'dcl-scene-writer'
import packageJson from 'decentraland/dist/samples/ecs/package.json'
import sceneJson from 'decentraland/dist/samples/ecs/scene.json'
import tsconfig from 'decentraland/dist/samples/ecs/tsconfig.json'
import { Rotation, Coordinate } from 'modules/deployment/types'
import { Project, Manifest } from 'modules/project/types'
import { Scene, ComponentData, ComponentType, ComponentDefinition, EntityDefinition } from 'modules/scene/types'
import { BUILDER_SERVER_URL } from 'lib/api/builder'
import { getParcelOrientation } from './utils'

export const MANIFEST_FILE_VERSION = 4

export enum EXPORT_PATH {
  MANIFEST_FILE = 'builder.json',
  GAME_FILE = 'src/game.ts',
  SCENE_FILE = 'scene.json',
  PACKAGE_FILE = 'package.json',
  DOCKER_FILE = 'Dockerfile',
  DCLIGNORE_FILE = '.dclignore',
  TSCONFIG_FILE = 'tsconfig.json',
  MODELS_FOLDER = 'models',
  NFT_BASIC_FRAME_FILE = 'models/frames/basic.glb',
  BUNDLED_GAME_FILE = 'bin/game.js'
}

export enum DownloadableFileType {
  MODEL = 'model',
  SCRIPT = 'script'
}

export type DownloadableFile = {
  type: DownloadableFileType
  url: string
}

export async function createFiles(args: {
  project: Project
  scene: Scene
  point: Coordinate
  rotation: Rotation
  isDeploy: boolean
  onProgress: (args: { loaded: number; total: number }) => void
}) {
  const { project, scene, point, rotation, isDeploy, onProgress } = args
  const models = await downloadFiles({ scene, onProgress })
  const sceneHasScripts = hasScripts(scene)
  const useLightweight = isDeploy && !sceneHasScripts
  const gameFile = createGameFile({ project, scene, rotation }, useLightweight)
  return {
    [EXPORT_PATH.MANIFEST_FILE]: JSON.stringify(createManifest(project, scene)),
    [EXPORT_PATH.GAME_FILE]: gameFile,
    [EXPORT_PATH.BUNDLED_GAME_FILE]: sceneHasScripts ? createGameFileBundle(gameFile) : gameFile,
    ...createDynamicFiles({ project, scene, point, rotation }),
    ...createStaticFiles(),
    ...models
  }
}

export function createManifest<T = Project>(project: T, scene: Scene): Manifest<T> {
  return { version: MANIFEST_FILE_VERSION, project, scene }
}

export function createGameFile(args: { project: Project; scene: Scene; rotation: Rotation }, useLightweight = false) {
  const { scene, project, rotation } = args
  const takenNames = new Set<string>()
  const Writer = useLightweight ? LightweightWriter : SceneWriter
  const writer = new Writer(ECS, require('decentraland-ecs/types/dcl/decentraland-ecs.api'))
  const { cols, rows } = project.layout
  const sceneEntity = new ECS.Entity()

  // 0. Rotate scene
  const size = 16
  let x = 0
  let y = 0
  let z = 0

  switch (rotation) {
    case 'north':
      y = -90
      x = cols * size
      z = 0
      break
    case 'east':
      y = 0
      x = 0
      z = 0
      break
    case 'south':
      y = 90
      x = 0
      z = rows * size
      break
    case 'west':
      y = 180
      x = rows * size
      z = cols * size
      break
  }
  const transform = new ECS.Transform({
    position: new ECS.Vector3(x, 0, z),
    rotation: ECS.Quaternion.Euler(0, y, 0)
  })
  sceneEntity.addComponent(transform)
  writer.addEntity('scene', sceneEntity as any)

  // Map component ids to entity ids
  const componentToEntity = new Map<string, string>()
  for (const entity of Object.values(scene.entities)) {
    for (const componentId of entity.components) {
      componentToEntity.set(componentId, entity.id)
    }
  }

  // 1. Create all components ands scripts
  const components: Record<string, object> = {}
  const scripts = new Map<string, string>()
  const hosts = new Set<string>()
  const instances: { entityId: string; assetId: string; parameters: Record<string, string | number> }[] = []
  for (const component of Object.values(scene.components)) {
    switch (component.type) {
      case ComponentType.GLTFShape: {
        const { src } = (component as ComponentDefinition<ComponentType.GLTFShape>).data
        const modelName = src // remove assetPackId
          .split('/')
          .slice(1)
          .join('/')
        components[component.id] = new ECS.GLTFShape(`${EXPORT_PATH.MODELS_FOLDER}/${modelName}`)
        break
      }
      case ComponentType.NFTShape: {
        const { url } = (component as ComponentDefinition<ComponentType.NFTShape>).data
        components[component.id] = new ECS.NFTShape(url)
        break
      }
      case ComponentType.Transform: {
        const { position, rotation, scale } = (component as ComponentDefinition<ComponentType.Transform>).data
        components[component.id] = new ECS.Transform({
          position: new ECS.Vector3(position.x, position.y, position.z),
          rotation: new ECS.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
          scale: new ECS.Vector3(scale.x, scale.y, scale.z)
        })
        break
      }
      case ComponentType.Script: {
        const { assetId, src, parameters } = (component as ComponentDefinition<ComponentType.Script>).data
        scripts.set(assetId, src)
        const entityId = componentToEntity.get(component.id)!
        hosts.add(entityId)
        instances.push({ entityId, assetId, parameters })
        break
      }
      default: {
        console.warn(`Could not compile component with id "${component.id}": Unknown type "${component.type}"`)
        break
      }
    }
  }

  // 2. Create all entities
  const entityIdToName = new Map<string, string>()
  for (const entity of Object.values(scene.entities)) {
    try {
      const ecsEntity = new ECS.Entity()
      ecsEntity.setParent(sceneEntity)

      const name = getUniqueName(entity, scene, takenNames)
      entityIdToName.set(entity.id, name)

      for (const componentId of entity.components) {
        const component = components[componentId]
        // placeholder gltfs and scripts are skipped
        if (!isScript(componentId, scene) && !isPlaceholder(componentId, scene)) {
          ecsEntity.addComponent(component)
        }
      }

      writer.addEntity(name, ecsEntity as any)
    } catch (e) {
      console.warn(e.message)
      continue
    }
  }

  let code = writer.emitCode()

  // SCRIPTS SECTION
  if (scripts.size > 0) {
    const scriptLoader: string = require('!raw-loader!../../ecsScene/remote-loader.js.raw')

    // create executeScripts function
    let executeScripts = 'async function executeScripts() {'
    const assetIdToScriptName = new Map<string, string>()
    let currentScript = 1
    // instantiate all the scripts
    for (const [assetId, src] of Array.from(scripts)) {
      const scriptName = 'script_' + currentScript++
      assetIdToScriptName.set(assetId, scriptName)
      executeScripts += `\n\tconst ${scriptName} = await getScriptInstance("${assetId}", "${src}")`
    }
    // initialize all the scripts
    for (const [assetId] of Array.from(scripts)) {
      const script = assetIdToScriptName.get(assetId)
      executeScripts += `\n\t${script}.init()`
    }
    // spawn all the instances
    for (const { entityId, assetId, parameters } of instances) {
      const script = assetIdToScriptName.get(assetId)
      const host = entityIdToName.get(entityId)
      const params = JSON.stringify(parameters)
      executeScripts += `\n\t${script}.spawn(${host}, ${params})`
    }
    // call function
    executeScripts += '\n}\nexecuteScripts()'

    code = code + '\n\n' + scriptLoader + '\n\n' + executeScripts
  }

  return code
}

export function createGameFileBundle(gameFile: string): string {
  const ecs = require('!raw-loader!../../ecsScene/ecs.js.raw')
  const amd = require('!raw-loader!../../ecsScene/amd-loader.js.raw')
  const code = `// ECS
${ecs}
// AMD
${amd}
// Builder generated code below
${gameFile}`
  return code
}

export function getUniqueName(entity: EntityDefinition, scene: Scene, takenNames: Set<string>) {
  let modelName
  try {
    const gltf = Object.values(scene.components).find(
      component => component.type === ComponentType.GLTFShape && entity.components.includes(component.id)
    )
    if (gltf) {
      const data = gltf.data as ComponentData[ComponentType.GLTFShape]
      modelName = data.src // path/to/ModelName.glb
        .split('/') // ["path", "to", "ModelName.glb"]
        .pop()! // "ModelName.glb"
        .split('.') // ["ModelName", "glb"]
        .shift() // "ModelName"
      if (!modelName) throw Error('Invalid name')
      modelName = modelName[0].toLowerCase() + modelName.slice(1) // PascalCase to camelCase
    } else {
      const nft = Object.values(scene.components).find(
        component => component.type === ComponentType.NFTShape && entity.components.includes(component.id)
      )
      if (nft) {
        modelName = 'nft'
      } else {
        throw new Error("Can't generate a name")
      }
    }
  } catch (e) {
    modelName = 'entity'
  }
  let name = modelName
  let attempts = 1
  while (takenNames.has(name)) {
    name = `${modelName}_${++attempts}`
  }
  takenNames.add(name)
  return name
}

export function createStaticFiles() {
  return {
    [EXPORT_PATH.TSCONFIG_FILE]: JSON.stringify(tsconfig),
    [EXPORT_PATH.DOCKER_FILE]: Dockerfile,
    [EXPORT_PATH.DCLIGNORE_FILE]: [
      '.*',
      'package.json',
      'package-lock.json',
      'yarn-lock.json',
      'build.json',
      'export',
      'tsconfig.json',
      'tslint.json',
      'node_modules',
      '*.ts',
      '*.tsx',
      'Dockerfile',
      'dist'
    ].join('\n')
  }
}

export async function downloadFiles(args: { scene: Scene; onProgress: (args: { loaded: number; total: number }) => void }) {
  const { scene, onProgress } = args
  const mappings: Record<string, DownloadableFile> = {}

  let models = {}
  let shouldDownloadFrame = false

  // Track progress
  let progress = 0
  let total = 0

  // Gather mappings
  for (const component of Object.values(scene.components)) {
    if (component.type === ComponentType.GLTFShape) {
      // placeholder gltf components are skipped
      if (!isPlaceholder(component.id, scene)) {
        const gltfShape = component as ComponentDefinition<ComponentType.GLTFShape>
        for (const key of Object.keys(gltfShape.data.mappings)) {
          const path = key
            .split('/')
            .slice(1)
            .join('/') // drop the asset id namespace
          mappings[path] = {
            type: DownloadableFileType.MODEL,
            url: `${BUILDER_SERVER_URL}/storage/assets/${gltfShape.data.mappings[key]}`
          }
        }
      }
    } else if (component.type === ComponentType.Script) {
      const script = component as ComponentDefinition<ComponentType.Script>
      for (const key of Object.keys(script.data.mappings)) {
        const path = key // use the namespaced path
        mappings[path] = {
          type: DownloadableFileType.SCRIPT,
          url: `${BUILDER_SERVER_URL}/storage/assets/${script.data.mappings[key]}`
        }
      }
    } else if (component.type === ComponentType.NFTShape) {
      shouldDownloadFrame = true
    }
  }

  // Download models
  total += Object.keys(mappings).length
  onProgress({ loaded: progress, total })

  const promises = Object.keys(mappings).map(path => {
    const { url, type } = mappings[path]
    return fetch(url)
      .then(resp => resp.blob())
      .then(blob => {
        progress++
        onProgress({ loaded: progress, total })
        return { path, blob, type }
      })
  })

  // Reduce results into a record of blobs
  const results = await Promise.all(promises)
  models = results.reduce<Record<string, Blob>>((obj, file) => {
    const path = file.type === DownloadableFileType.MODEL ? `${EXPORT_PATH.MODELS_FOLDER}/${file.path}` : file.path // script files are already namespaced
    return { ...obj, [path]: file.blob }
  }, {})

  if (shouldDownloadFrame) {
    total++
    const resp = await fetch('/' + EXPORT_PATH.NFT_BASIC_FRAME_FILE)
    const blob = await resp.blob()
    progress++
    onProgress({ loaded: progress, total })
    models = {
      ...models,
      [EXPORT_PATH.NFT_BASIC_FRAME_FILE]: blob
    }
  }

  return models
}

export function createDynamicFiles(args: { project: Project; scene: Scene; point: Coordinate; rotation: Rotation }) {
  const { project, scene, rotation, point } = args

  const files = {
    [EXPORT_PATH.MANIFEST_FILE]: JSON.stringify({
      version: MANIFEST_FILE_VERSION,
      project,
      scene
    }),
    [EXPORT_PATH.PACKAGE_FILE]: JSON.stringify(
      {
        ...packageJson,
        name: project.id
      },
      null,
      2
    ),
    [EXPORT_PATH.SCENE_FILE]: JSON.stringify(getSceneDefinition(project, point, rotation), null, 2)
  }

  return files
}

export function getSceneDefinition(project: Project, point: Coordinate, rotation: Rotation) {
  const parcels = getParcelOrientation(project, point, rotation)
  const base = parcels.reduce((base, parcel) => (parcel.x <= base.x && parcel.y <= base.y ? parcel : base), parcels[0])

  return {
    ...sceneJson,
    scene: {
      ...sceneJson.scene,
      parcels: parcels.map(parcelToString),
      base: parcelToString(base)
    },
    source: {
      origin: 'builder',
      projectId: project.id
    }
  }
}

export function parcelToString({ x, y }: { x: number; y: number }) {
  return x + ',' + y
}

export function isPlaceholder(componentId: string, scene: Scene) {
  const component = scene.components[componentId]
  if (component && component.type === ComponentType.GLTFShape) {
    const entity = Object.values(scene.entities).find(entity => entity.components.some(id => id === componentId))
    if (entity) {
      const isHost = entity.components.some(id => scene.components[id].type === ComponentType.Script)
      return isHost
    }
  }
  return false
}

export function isScript(componentId: string, scene: Scene) {
  const component = scene.components[componentId]
  return component && component.type === ComponentType.Script
}

export function hasScripts(scene: Scene) {
  return Object.values(scene.components).some(component => component.type === ComponentType.Script)
}
