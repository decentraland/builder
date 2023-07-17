import { Composite } from '@dcl/ecs'
import { createEngineContext, dumpEngineToComposite } from '@dcl/inspector'
import { Project } from 'modules/project/types'
import { ComponentData, ComponentType, Scene } from 'modules/scene/types'

export function getParcels(project: Project) {
  const parcels: { x: number; y: number }[] = []
  for (let x = 0; x < project.layout.rows; x++) {
    for (let y = 0; y < project.layout.rows; y++) {
      parcels.push({ x, y })
    }
  }
  return parcels
}

export function toPath(path: string) {
  return `assets/scene/models/${path}`
}

export function toComposite(scene: Scene, project?: Project) {
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
      parcels: project ? getParcels(project) : [{ x: 0, y: 0 }],
      base: {
        x: 0,
        y: 0
      }
    }
  })

  const composite = dumpEngineToComposite(engine as any, 'json')
  return Composite.toJson(composite) as string
}

export function toMappings(scene: Scene): Record<string, string> {
  const mappings: Record<string, string> = {}
  for (const asset of Object.values(scene.assets)) {
    for (const path in asset.contents) {
      const hash = asset.contents[path]
      mappings[toPath(path)] = hash
    }
  }
  return mappings
}
