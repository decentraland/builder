/* eslint-disable import/no-webpack-loader-syntax */
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import sceneJsonSample from 'decentraland/samples/ecs/scene.json'
import { Rotation, Coordinate, SceneDefinition } from 'modules/deployment/types'
import { Project, Manifest } from 'modules/project/types'
import { Scene, ComponentType, ComponentDefinition, SceneSDK6, SceneSDK7 } from 'modules/scene/types'
import { BuilderAPI, getContentsStorageUrl } from 'lib/api/builder'
import { AssetParameterValues } from 'modules/asset/types'
import { migrations } from 'modules/migrations/manifest'
import { wrapSdk6, wrapSdk7 } from 'modules/migrations/utils'
import { reHashContent } from 'modules/deployment/contentUtils'
import { NO_CACHE_HEADERS } from 'lib/headers'
import { getParcelOrientation } from './utils'

const SCENE_TEMPLATE_URL = 'https://raw.githubusercontent.com/decentraland/sdk-empty-scene-template/main'

export const MANIFEST_FILE_VERSION = Math.max(...Object.keys(migrations).map(version => parseInt(version, 10)))

const { communications: _communications, policy: _policy, ...sceneWithoutOutdatedProperties } = sceneJsonSample
const sceneJson: SceneDefinition = sceneWithoutOutdatedProperties

export enum EXPORT_PATH {
  MANIFEST_FILE = 'builder.json',
  GAME_FILE = 'src/game.ts',
  SCENE_FILE = 'scene.json',
  PACKAGE_FILE = 'package.json',
  DOCKER_FILE = 'Dockerfile',
  DCLIGNORE_FILE = '.dclignore',
  TSCONFIG_FILE = 'tsconfig.json',
  BUNDLED_GAME_FILE = 'bin/game.js',
  THUMBNAIL_FILE = 'scene-thumbnail.png',
  GITIGNORE_FILE = '.gitignore',
  MAIN_CRDT_FIE = 'main.crdt',
  MAIN_COMPOSITE_FILE = 'assets/scene/main.composite',
  INDEX_FILE = 'src/index.ts',
  VSCODE_EXTENSIONS_FILE = '.vscode/extensions.json',
  VSCODE_LAUNCH_FILE = '.vscode/launch.json'
}

export type Mapping = {
  localPath: string
  remotePath: string
}

export const SCRIPT_CONSTRUCTOR_NAME = 'Script'
export const SCRIPT_INSTANCE_NAME = 'script'

export async function createFiles(args: {
  project: Project
  scene: SceneSDK6
  point: Coordinate
  rotation: Rotation
  thumbnail: string | null
  author: string | null
  isDeploy: boolean
  isEmpty?: boolean
  world?: string
  onProgress: (args: { loaded: number; total: number }) => void
}) {
  const { project, scene, point, rotation, thumbnail, author, isDeploy, isEmpty, world, onProgress } = args
  const files = await downloadFiles({ scene, onProgress, isDeploy })
  const gameFile = await createGameFile({ project, scene, rotation }, isDeploy)

  return {
    // @ts-ignore: 'builder.json' is specified more than once, but don't want to break anything
    [EXPORT_PATH.MANIFEST_FILE]: JSON.stringify(createManifest(project, scene)),
    [EXPORT_PATH.GAME_FILE]: gameFile,
    [EXPORT_PATH.BUNDLED_GAME_FILE]: hasScripts(scene) ? await createGameFileBundle(gameFile) : gameFile,
    [EXPORT_PATH.THUMBNAIL_FILE]: await createThumbnailBlob(thumbnail, isEmpty),
    ...(await createDynamicFiles({ project, scene, point, rotation, thumbnail: EXPORT_PATH.THUMBNAIL_FILE, author, isEmpty, world })),
    ...(await createStaticFiles()),
    ...files
  }
}

export function createManifest<T = Project>(project: T, scene: Scene): Manifest<T> {
  return { version: MANIFEST_FILE_VERSION, project, scene }
}

export async function createGameFile(args: { project: Project; scene: SceneSDK6; rotation: Rotation }, isDeploy = false) {
  const { scene, project, rotation } = args
  const useLightweight = isDeploy && !hasScripts(scene)
  const [SceneWriterModule, ecsAPI, ECS] = await Promise.all([
    import('dcl-scene-writer'),
    import('decentraland-ecs/types/dcl/decentraland-ecs.api?raw').then(module => JSON.parse(module.default)),
    import('decentraland-ecs')
  ])
  const Writer = useLightweight ? SceneWriterModule.LightweightWriter : SceneWriterModule.SceneWriter
  const writer = new Writer(ECS, ecsAPI)
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
  writer.addEntity('_scene', sceneEntity as any)

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
  const instances: { entityId: string; assetId: string; values: AssetParameterValues }[] = []
  for (const component of Object.values(scene.components)) {
    switch (component.type) {
      case ComponentType.GLTFShape: {
        const { assetId } = (component as ComponentDefinition<ComponentType.GLTFShape>).data
        const asset = scene.assets[assetId]
        components[component.id] = new ECS.GLTFShape(buildAssetPath(asset.id, asset.model))
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
        const { assetId, values } = (component as ComponentDefinition<ComponentType.Script>).data
        const asset = scene.assets[assetId]
        const src = asset.contents[asset.script!]
        scripts.set(assetId, src)
        const entityId = componentToEntity.get(component.id)!
        hosts.add(entityId)
        instances.push({ entityId, assetId, values })
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

      const { name } = entity
      entityIdToName.set(entity.id, name)

      for (const componentId of entity.components) {
        const component = components[componentId]
        // placeholder gltfs and scripts are skipped
        if (component && !isScript(componentId, scene) && !isPlaceholder(componentId, scene)) {
          ecsEntity.addComponent(component)
        }
      }

      writer.addEntity(name, ecsEntity as any)
    } catch (e) {
      console.warn(isErrorWithMessage(e) ? e.message : 'Unknown error')
      continue
    }
  }
  let code = writer.emitCode()

  // SCRIPTS SECTION
  if (scripts.size > 0) {
    if (isDeploy) {
      const [scriptLoader, builderChannelRaw, builderInventoryRaw] = await Promise.all([
        import('../../ecsScene/remote-loader.js.raw?raw').then(module => module.default),
        import('decentraland-builder-scripts/lib/channel?raw').then(module => module.default),
        import('decentraland-builder-scripts/lib/inventory?raw').then(module => module.default)
      ])

      // create executeScripts function
      let executeScripts = 'async function executeScripts() {'
      const assetIdToScriptName = new Map<string, string>()
      let currentScript = 1

      // setup channel
      executeScripts += `\n\tconst channelId = Math.random().toString(16).slice(2)`
      executeScripts += `\n\tconst channelBus = new MessageBus()`
      executeScripts += `\n`
      executeScripts += `\n\tconst inventory = createInventory(UICanvas, UIContainerStack, UIImage)`
      executeScripts += `\n\tconst options = { inventory }`
      executeScripts += `\n`

      // instantiate all the scripts
      for (const [assetId, src] of Array.from(scripts)) {
        const scriptName = SCRIPT_INSTANCE_NAME + currentScript++
        assetIdToScriptName.set(assetId, scriptName)
        const hash = await reHashContent(src, EXPORT_PATH.BUNDLED_GAME_FILE)
        executeScripts += `\n\tconst ${scriptName} = await getScriptInstance("${assetId}", "${hash}")`
      }
      // initialize all the scripts
      for (const [assetId] of Array.from(scripts)) {
        const script = assetIdToScriptName.get(assetId)
        executeScripts += `\n\t${script}.init(options)`
      }
      // spawn all the instances
      for (const { entityId, assetId, values } of instances) {
        const script = assetIdToScriptName.get(assetId)
        const host = entityIdToName.get(entityId)
        const params = JSON.stringify(values)
        executeScripts += `\n\t${script}.spawn(${host}, ${params}, createChannel(channelId, ${host}, channelBus))`
      }
      // call function
      executeScripts += '\n}\nexecuteScripts()'

      const builderScripts =
        `var exports = {}\n` + builderChannelRaw.replace(`'use strict'`, `''`) + `\n` + builderInventoryRaw.replace(`'use strict'`, `''`)

      code = builderScripts + '\n\n' + code + '\n\n' + scriptLoader + '\n\n' + executeScripts
    } else {
      // import all the scripts
      let importScripts = ''
      importScripts += `import { createChannel } from '../node_modules/decentraland-builder-scripts/channel'\n`
      importScripts += `import { createInventory } from '../node_modules/decentraland-builder-scripts/inventory'\n`
      let currentImport = 1
      const assetIdToConstructorName = new Map<string, string>()
      for (const [assetId] of Array.from(scripts)) {
        const constructorName = SCRIPT_CONSTRUCTOR_NAME + currentImport++
        assetIdToConstructorName.set(assetId, constructorName)
        importScripts += `import ${constructorName} from "../${assetId}/src/item"\n`
      }

      // execute all the scripts
      let executeScripts = '\n'

      // setup channel
      executeScripts += `const channelId = Math.random().toString(16).slice(2)\n`
      executeScripts += `const channelBus = new MessageBus()\n`
      executeScripts += `const inventory = createInventory(UICanvas, UIContainerStack, UIImage)\n`
      executeScripts += `const options = { inventory }\n`

      let currentInstance = 1
      const assetIdToScriptName = new Map<string, string>()
      // instantiate all the scripts
      for (const [assetId] of Array.from(scripts)) {
        const scriptName = SCRIPT_INSTANCE_NAME + currentInstance++
        assetIdToScriptName.set(assetId, scriptName)
        executeScripts += `\nconst ${scriptName} = new ${assetIdToConstructorName.get(assetId)}()`
      }
      // initialize all the scripts
      for (const [assetId] of Array.from(scripts)) {
        const script = assetIdToScriptName.get(assetId)
        executeScripts += `\n${script}.init(options)`
      }
      // spawn all the instances
      for (const { entityId, assetId, values } of instances) {
        const script = assetIdToScriptName.get(assetId)
        const host = entityIdToName.get(entityId)
        const params = JSON.stringify(values)
        executeScripts += `\n${script}.spawn(${host}, ${params}, createChannel(channelId, ${host}, channelBus))`
      }

      code = importScripts + code + executeScripts
    }
  }

  return code
}

export async function createGameFileBundle(gameFile: string): Promise<string> {
  const [sceneECS, amd] = await Promise.all([
    import('../../ecsScene/ecs.js.raw?raw').then(module => module.default),
    import('../../ecsScene/amd-loader.js.raw?raw').then(module => module.default)
  ])
  const code = `// ECS
${sceneECS}
// AMD
${amd}
// Builder generated code below
${gameFile}`
  return code
}

export async function createStaticFiles() {
  return {
    [EXPORT_PATH.DOCKER_FILE]: (await import('decentraland/samples/ecs/Dockerfile?raw')).default,
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

export async function downloadFiles(args: {
  scene: SceneSDK6
  onProgress: (args: { loaded: number; total: number }) => void
  isDeploy: boolean
}) {
  const { scene, onProgress, isDeploy } = args
  const mappings: Record<string, string> = {}

  let files: Record<string, Blob> = {}

  // Track progress
  let progress = 0
  let total = 0

  // Gather mappings
  for (const asset of Object.values(scene.assets)) {
    for (const path of Object.keys(asset.contents)) {
      const localPath = buildAssetPath(asset.id, path)
      const remotePath = getContentsStorageUrl(asset.contents[path])
      mappings[localPath] = remotePath
    }
  }

  // Download models
  const paths = Object.keys(mappings).filter(path => (isDeploy ? !path.endsWith('.ts') : !path.endsWith('.js')))
  total += paths.length
  onProgress({ loaded: progress, total })

  const promises = paths.map(path => {
    const url = mappings[path]
    return fetch(url, { headers: NO_CACHE_HEADERS })
      .then(resp => resp.blob())
      .then(blob => {
        progress++
        onProgress({ loaded: progress, total })
        return { path, blob }
      })
  })

  // Reduce results into a record of blobs
  const results = await Promise.all(promises)
  files = results.reduce<Record<string, Blob>>((files, file) => {
    files[file.path] = file.blob
    return files
  }, {})

  // namespace paths in source files
  const sourceFiles = Object.keys(files).filter(path => path.endsWith('.ts'))
  for (const sourceFile of sourceFiles) {
    // 1. Find the namespace (this is a uuid)
    const namespace = sourceFile.split('/')[0]
    if (!namespace) {
      console.warn(`Namespace not found in source file "${sourceFile}"`)
      continue
    }

    // 2. Find all the mappings under that namespace, and remove the namespace
    const nestedPaths = []
    for (const path of Object.keys(files)) {
      if (path.startsWith(namespace + '/')) {
        const relativePath = path.split(namespace + '/').pop()!
        nestedPaths.push(relativePath)
      }
    }

    // 3. Convert the blob to text
    const blob = files[sourceFile]
    let text = await new Response(blob).text()

    // 4. Replace all paths with their namespaced path
    for (const path of nestedPaths) {
      text = text.replace(new RegExp(path, 'g'), `${namespace}/${path}`)
    }

    // 5. Convert text to blob
    files[sourceFile] = new Blob([text], { type: 'text/plain' })
  }

  return files
}

export async function createDynamicFiles(args: {
  project: Project
  scene: SceneSDK6
  point: Coordinate
  rotation: Rotation
  thumbnail: string | null
  author: string | null
  isEmpty?: boolean
  world?: string
}) {
  const { project, scene, rotation, point, thumbnail, author, isEmpty, world } = args
  const [packageJson, tsconfig] = await Promise.all([
    import('decentraland/samples/ecs/package.json'),
    import('decentraland/samples/ecs/tsconfig.json')
  ])
  const files = {
    [EXPORT_PATH.MANIFEST_FILE]: JSON.stringify({
      version: MANIFEST_FILE_VERSION,
      project,
      scene: wrapSdk6(scene)
    }),
    [EXPORT_PATH.PACKAGE_FILE]: JSON.stringify(
      {
        ...packageJson,
        name: project.id,
        dependencies: {
          ...packageJson.devDependencies,
          'decentraland-builder-scripts': 'latest'
        }
      },
      null,
      2
    ),
    [EXPORT_PATH.SCENE_FILE]: JSON.stringify(getSceneDefinition(project, point, rotation, thumbnail, author, isEmpty, world), null, 2),
    [EXPORT_PATH.TSCONFIG_FILE]: JSON.stringify(
      {
        ...tsconfig,
        include: tsconfig.include.concat(['./node_modules/decentraland-builder-scripts/types.d.ts'])
      },
      null,
      2
    )
  }

  return files
}

export function getSceneDefinition(
  project: Project,
  point: Coordinate,
  rotation: Rotation,
  thumbnail: string | null,
  author: string | null,
  isEmpty?: boolean,
  name?: string,
  isSDK7?: boolean
) {
  const parcels = getParcelOrientation(project.layout, point, rotation)
  const base = parcels.reduce((base, parcel) => (parcel.x <= base.x && parcel.y <= base.y ? parcel : base), parcels[0])

  const sceneDefinition: SceneDefinition = {
    ...sceneJson,
    display: {
      ...sceneJson.display!,
      title: project.title
    },
    scene: {
      ...sceneJson.scene,
      parcels: parcels.map(parcelToString),
      base: parcelToString(base)
    },
    source: {
      version: 1,
      origin: 'builder',
      projectId: project.id,
      point,
      rotation,
      layout: project.layout
    }
  }

  if (thumbnail) {
    sceneDefinition.display!.navmapThumbnail = thumbnail
  }

  if (author) {
    sceneDefinition.contact.name = author
  }

  if (isEmpty) {
    sceneDefinition.source!.isEmpty = true
  }

  if (name) {
    sceneDefinition.worldConfiguration = {
      name: name
    }
  }

  if (isSDK7) {
    sceneDefinition.allowedMediaHostnames = []
    sceneDefinition.ecs7 = true
    sceneDefinition.main = 'bin/index.js'
    sceneDefinition.runtimeVersion = '7'
  }

  return sceneDefinition
}

export function parcelToString({ x, y }: { x: number; y: number }) {
  return x + ',' + y
}

export function isPlaceholder(componentId: string, scene: SceneSDK6) {
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

export function isScript(componentId: string, scene: SceneSDK6) {
  const component = scene.components[componentId]
  return component && component.type === ComponentType.Script
}

export function hasScripts(scene: SceneSDK6) {
  return Object.values(scene.components).some(component => component.type === ComponentType.Script)
}

async function createThumbnailBlob(thumbnail: string | null, isClearDeployment: boolean = false) {
  if (thumbnail) {
    try {
      const headers = !isClearDeployment ? NO_CACHE_HEADERS : {}
      const resp = await fetch(thumbnail, { headers })
      const blob = await resp.blob()
      return blob
    } catch (error) {
      console.error(isErrorWithMessage(error) ? error.message : 'Unknown error')
    }
  }
  return new Blob([])
}

export function buildAssetPath(namespace: string, path: string) {
  return `${namespace}/${path}`
}

// SDK7

export async function downloadSDK7File(key: string, url: string): Promise<{ path: string; file: Blob }> {
  return fetch(url)
    .then(resp => resp.blob())
    .then(blob => ({ path: key, file: blob }))
}

export async function createSDK7Files({ project, scene, builderAPI }: { project: Project; scene: SceneSDK7; builderAPI: BuilderAPI }) {
  // external files
  const staticFiles: Record<string, string> = {
    [EXPORT_PATH.DCLIGNORE_FILE]: `${SCENE_TEMPLATE_URL}/${EXPORT_PATH.DCLIGNORE_FILE}`,
    [EXPORT_PATH.PACKAGE_FILE]: `${SCENE_TEMPLATE_URL}/${EXPORT_PATH.PACKAGE_FILE}`,
    [EXPORT_PATH.TSCONFIG_FILE]: `${SCENE_TEMPLATE_URL}/${EXPORT_PATH.TSCONFIG_FILE}`,
    [EXPORT_PATH.GITIGNORE_FILE]: `${SCENE_TEMPLATE_URL}/${EXPORT_PATH.GITIGNORE_FILE}`,
    [EXPORT_PATH.VSCODE_EXTENSIONS_FILE]: `${SCENE_TEMPLATE_URL}/${EXPORT_PATH.VSCODE_EXTENSIONS_FILE}`,
    [EXPORT_PATH.VSCODE_LAUNCH_FILE]: `${SCENE_TEMPLATE_URL}/${EXPORT_PATH.VSCODE_LAUNCH_FILE}`,
    [EXPORT_PATH.INDEX_FILE]: `${SCENE_TEMPLATE_URL}/${EXPORT_PATH.INDEX_FILE}`,
    [EXPORT_PATH.THUMBNAIL_FILE]: project.thumbnail
  }

  const mappings: Record<string, string> = Object.keys(scene.mappings).reduce((files, key) => {
    files[key] = getContentsStorageUrl(scene.mappings[key])
    return files
  }, {} as Record<string, string>)

  const externalFilesUrls = { ...mappings, ...staticFiles }
  const externalFilesPromises = Object.keys(externalFilesUrls).map(async (key: string) => {
    return downloadSDK7File(key, externalFilesUrls[key])
  })

  const externalFiles = (await Promise.all(externalFilesPromises)).reduce((result, { path, file }) => {
    result[path] = file
    return result
  }, {} as Record<string, Blob>)

  // dynamic Files
  const mainCrdt = await builderAPI.fetchCrdt(project.id)
  const mainComposite = new Blob([new TextEncoder().encode(JSON.stringify(scene.composite))])
  const sceneJson = new Blob([
    new TextEncoder().encode(
      JSON.stringify(
        getSceneDefinition(project, { x: 0, y: 0 }, 'east', EXPORT_PATH.THUMBNAIL_FILE, project.ethAddress, undefined, undefined, true)
      )
    )
  ])
  const builderJson = new Blob([
    new TextEncoder().encode(
      JSON.stringify({
        version: MANIFEST_FILE_VERSION,
        project,
        scene: wrapSdk7(scene)
      })
    )
  ])
  return {
    ...externalFiles,
    [EXPORT_PATH.MAIN_CRDT_FIE]: mainCrdt,
    [EXPORT_PATH.MAIN_COMPOSITE_FILE]: mainComposite,
    [EXPORT_PATH.SCENE_FILE]: sceneJson,
    [EXPORT_PATH.MANIFEST_FILE]: builderJson
  }
}
