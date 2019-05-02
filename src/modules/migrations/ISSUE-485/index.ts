import { Scene, ComponentType, ComponentDefinition } from 'modules/scene/types'
import mappings from './mappings.json'

export function addMappings(scene: Scene | null) {
  if (scene) {
    for (const component of Object.values(scene.components)) {
      if (component.type === ComponentType.GLTFShape) {
        const gltfShape = component as ComponentDefinition<ComponentType.GLTFShape>
        const hasMappings = 'mappings' in gltfShape.data
        if (!hasMappings) {
          gltfShape.data.mappings = (mappings as Record<string, Record<string, string>>)[gltfShape.data.src]
        }
      }
    }
  }
}
