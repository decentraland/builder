import { ComponentType, ComponentDefinition, SceneSDK6 } from 'modules/scene/types'
import mappings from './mappings.json'

export function addMappings(scene: SceneSDK6 | null) {
  if (scene) {
    for (const component of Object.values(scene.components)) {
      if (component.type === ComponentType.GLTFShape) {
        const gltfShape = component as ComponentDefinition<ComponentType.GLTFShape>
        const hasMappings = 'mappings' in gltfShape.data
        const hasSource = 'src' in gltfShape.data
        if (!hasMappings && hasSource) {
          const data = gltfShape.data as any
          data.mappings = (mappings as Record<string, Record<string, string>>)[(gltfShape.data as any).src]
        }
      }
    }
  }
}
