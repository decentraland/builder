import { Composite } from '@dcl/ecs'
import { createEngineContext, dumpEngineToComposite } from '@dcl/inspector'
import { ComponentData, ComponentType, Scene } from 'modules/scene/types'

export function toPath(path: string) {
  return `assets/scene/models/${path}`
}

export function toComposite(scene: Scene) {
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
