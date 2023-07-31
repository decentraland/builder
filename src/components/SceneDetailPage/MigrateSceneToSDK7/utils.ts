import { ComponentType, Scene } from 'modules/scene/types'

export function getSmartItemsCount(scene: Scene | null) {
  if (scene && scene.sdk6) {
    const components = Object.values(scene.sdk6.components)
    return components.filter(component => component.type === ComponentType.Script).length
  }

  return 0
}
