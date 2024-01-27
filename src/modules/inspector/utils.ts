import { merge } from 'ts-deepmerge'
import { Composite, CompositeDefinition } from '@dcl/ecs'
import { createEngineContext, dumpEngineToComposite, dumpEngineToCrdtCommands } from '@dcl/inspector'
import { Layout, Project } from 'modules/project/types'
import { ComponentData, ComponentType, SceneSDK6, SceneSDK7 } from 'modules/scene/types'

export function getParcels(layout: Layout) {
  const parcels: { x: number; y: number }[] = []
  for (let x = 0; x < layout.rows; x++) {
    for (let y = 0; y < layout.cols; y++) {
      parcels.push({ x, y })
    }
  }
  return parcels
}

export function toPath(path: string) {
  return `assets/scene/models/${path}`
}

export function getEngine(scene: SceneSDK6, project?: Project) {
  const { engine, components } = createEngineContext()

  for (const entity of Object.values(scene.entities)) {
    const entityId = engine.addEntity()
    components.Name.createOrReplace(entityId, { value: entity.name })
    for (const componentId of entity.components) {
      const component = scene.components[componentId]
      switch (component.type) {
        case ComponentType.Transform: {
          const data = component.data as ComponentData[ComponentType.Transform]
          components.Transform.createOrReplace(entityId, data)
          break
        }
        case ComponentType.GLTFShape: {
          const data = component.data as ComponentData[ComponentType.GLTFShape]
          const asset = scene.assets[data.assetId]
          components.GltfContainer.createOrReplace(entityId, { src: toPath(asset.model) })
          break
        }
      }
    }
  }

  components.Scene.createOrReplace(engine.RootEntity, {
    layout: {
      parcels: project ? getParcels(project.layout) : [{ x: 0, y: 0 }],
      base: {
        x: 0,
        y: 0
      }
    }
  })
  return engine
}

export function toComposite(scene: SceneSDK6, project?: Project) {
  const engine = getEngine(scene, project)
  const composite = dumpEngineToComposite(engine as any, 'json')
  return Composite.toJson(composite) as CompositeDefinition
}

export function toMappings(scene: SceneSDK6): Record<string, string> {
  const mappings: Record<string, string> = {}
  for (const asset of Object.values(scene.assets)) {
    for (const path in asset.contents) {
      const hash = asset.contents[path]
      mappings[toPath(path)] = hash
    }
  }
  return mappings
}

export function toCrdt(scene: SceneSDK6, project?: Project) {
  const engine = getEngine(scene, project)
  return dumpEngineToCrdtCommands(engine as any)
}

export function changeLayout(scene: SceneSDK7, layout: Layout) {
  const newScene: SceneSDK7 = merge({}, scene)
  const parcels = getParcels(layout).map(({ x, y }) => `${x},${y}`)
  newScene.metadata = merge.withOptions({ mergeArrays: false }, newScene.metadata!, {
    scene: {
      parcels
    }
  })
  return newScene
}
