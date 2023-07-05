import { Composite } from '@dcl/ecs'
import { createEngineContext, dumpEngineToComposite } from '@dcl/inspector'
import { ComponentData, ComponentType, Scene } from 'modules/scene/types'

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
          components.GltfContainer.createOrReplace(entityId, { src: asset.model })
          break
        }
      }
    }
  }

  const composite = dumpEngineToComposite(engine as any, 'json')
  return Composite.toJson(composite) as string
}
