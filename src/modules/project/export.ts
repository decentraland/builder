// @ts-ignore
import Dockerfile from '!raw-loader!decentraland/dist/samples/ecs/Dockerfile'
import * as ECS from 'decentraland-ecs'
import Writer from 'dcl-scene-writer'
import packageJson from 'decentraland/dist/samples/ecs/package.json'
import sceneJson from 'decentraland/dist/samples/ecs/scene.json'
import tsconfig from 'decentraland/dist/samples/ecs/tsconfig.json'
import { Project } from 'modules/project/types'
import { Scene, ComponentData, ComponentType, ComponentDefinition, EntityDefinition } from 'modules/scene/types'
import { FullAssetPack } from 'modules/assetPack/types'
import { CONTENT_SERVER } from 'modules/editor/utils'
import { api } from 'lib/api'

export const BUILDER_FILE_VERSION = 1

export enum EXPORT_PATH {
  BUILDER_FILE = 'builder.json',
  GAME_FILE = 'src/game.ts',
  SCENE_FILE = 'scene.json',
  PACKAGE_FILE = 'package.json',
  DOCKER_FILE = 'Dockerfile',
  DCLIGNORE_FILE = '.dclignore',
  TSCONFIG_FILE = 'tsconfig.json',
  MODELS_FOLDER = 'models'
}

type ModelPath = { local: string; remote: string }

export async function createFiles(args: {
  project: Project
  scene: Scene
  onProgress: (args: { progress: number; total: number }) => void
}) {
  const { project, scene, onProgress } = args
  const models = await createModels({ scene, onProgress })
  return {
    [EXPORT_PATH.BUILDER_FILE]: JSON.stringify({ version: BUILDER_FILE_VERSION, project, scene }),
    [EXPORT_PATH.GAME_FILE]: createGameFile({ project, scene }),
    ...createDynamicFiles(project),
    ...createStaticFiles(),
    ...models
  }
}

export function createGameFile(args: { project: Project; scene: Scene }) {
  const { scene } = args
  const takenNames = new Set<string>()
  const writer = new Writer(ECS, require('decentraland-ecs/types/dcl/decentraland-ecs.api'))

  // 1. Create all components
  const components: Record<string, object> = {}
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
      case ComponentType.Transform: {
        const { position, rotation } = (component as ComponentDefinition<ComponentType.Transform>).data
        components[component.id] = new ECS.Transform({
          position: new ECS.Vector3(position.x, position.y, position.z),
          rotation: new ECS.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
        })
        break
      }
      default: {
        console.warn(`Could not compile component with id "${component.id}": Unknown type "${component.type}"`)
        break
      }
    }
  }

  // 2. Create all entities
  for (const entity of Object.values(scene.entities)) {
    try {
      const ecsEntity = new ECS.Entity()

      for (const componentId of entity.components) {
        ecsEntity.addComponent(components[componentId])
      }

      const name = getUniqueName(entity, scene, takenNames)

      writer.addEntity(name, ecsEntity as any)
    } catch (e) {
      console.warn(e.message)
      continue
    }
  }

  return writer.emitCode()
}

export function getUniqueName(entity: EntityDefinition, scene: Scene, takenNames: Set<string>) {
  const gltf = Object.values(scene.components).find(component => component.type === 'GLTFShape' && entity.components.includes(component.id))
  if (!gltf) {
    throw new Error(`Could not compile entity with id "${entity.id}": Missing GLTFShape component`)
  }
  const data = gltf.data as ComponentData[ComponentType.GLTFShape]
  let modelName
  try {
    modelName = data.src // path/to/ModelName.glb
      .split('/') // ["path", "to", "ModelName.glb"]
      .pop()! // "ModelName.glb"
      .split('.') // ["ModelName", "glb"]
      .shift() // "ModelName"
    if (!modelName) throw Error('Invalid name')
  } catch (e) {
    modelName = 'Entity'
  }
  let name = modelName
  let attempts = 1
  while (takenNames.has(name)) {
    name = `${modelName}_${++attempts}`
  }
  takenNames.add(name)
  return name
}

export function createDynamicFiles(project: Project) {
  const parcels = project.parcels!.map(({ x, y }) => x + ',' + y)
  return {
    [EXPORT_PATH.PACKAGE_FILE]: JSON.stringify(
      {
        ...packageJson,
        name: project.title.toLowerCase().replace(/\s/g, '_')
      },
      null,
      2
    ),
    [EXPORT_PATH.SCENE_FILE]: JSON.stringify(
      {
        ...sceneJson,
        scene: {
          ...sceneJson.scene,
          parcels,
          base: parcels[0]
        },
        source: {
          origin: 'builder',
          projectId: project.id
        }
      },
      null,
      2
    )
  }
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

export async function createModels(args: { scene: Scene; onProgress: (args: { progress: number; total: number }) => void }) {
  const { scene, onProgress } = args
  const modelPaths: ModelPath[] = []
  const assetsByAssetPack: Record<string, string[]> = {}

  // progress
  let progress = 0
  let total = 0

  // Filter asset packs
  for (const component of Object.values(scene.components)) {
    if (component.type === ComponentType.GLTFShape) {
      // @ts-ignore
      const [assetPackId, ...rest] = (component as ComponentDefinition<ComponentType.GLTFShape>).data.src.split('/')
      if (!(assetPackId in assetsByAssetPack)) {
        assetsByAssetPack[assetPackId] = []
      }
      const src = rest.join('/')
      assetsByAssetPack[assetPackId].push(src)
    }
  }
  const assetPacks: Record<string, FullAssetPack> = {}
  const assetPackIds = Object.keys(assetsByAssetPack)
  const assetPackPromises = []
  total += assetPackIds.length
  onProgress({ progress, total })
  for (const assetPackId of assetPackIds) {
    const promise = api.fetchAssetPack(assetPackId).then((assetPack: FullAssetPack) => {
      progress++
      onProgress({ progress, total })
      assetPacks[assetPackId] = assetPack
    })
    assetPackPromises.push(promise)
  }
  await Promise.all(assetPackPromises)

  for (const assetPackId of Object.keys(assetsByAssetPack)) {
    const assetPack = assetPacks[assetPackId]
    for (const assetSrc of assetsByAssetPack[assetPackId]) {
      const asset = assetPack.assets.find(asset => assetSrc in asset.contents)
      if (!asset) {
        console.warn(`Could not load asset with src "${assetSrc}"`)
        continue
      }
      for (const path of Object.keys(asset.contents)) {
        const hash = asset.contents[path]
        const isThumbnail = asset.thumbnail.includes(hash)
        if (!isThumbnail) {
          modelPaths.push({ local: path, remote: CONTENT_SERVER + hash })
        }
      }
    }
  }

  const modelPromises = []
  total += modelPaths.length
  onProgress({ progress, total })
  for (const modelPath of modelPaths) {
    const promise = fetch(modelPath.remote)
      .then(resp => resp.blob())
      .then(blob => {
        progress++
        onProgress({ progress, total })
        return { path: modelPath.local, blob }
      })
    modelPromises.push(promise)
  }

  const results = await Promise.all<{ path: string; blob: Blob }>(modelPromises)
  return results.reduce<Record<string, Blob>>((obj, item) => {
    const path = `${EXPORT_PATH.MODELS_FOLDER}/${item.path}`
    return { ...obj, [path]: item.blob }
  }, {})
}
