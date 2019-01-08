import { ComponentDefinition, AnyComponent, ComponentType } from 'modules/component/types'
import { ComponentState } from 'react'
import { EntityState } from 'modules/entity/reducer'

export function getVarName(): string {
  return (
    'v' +
    Math.random()
      .toString(36)
      .substring(10)
  )
}

/**
 * Generates a script where all GLTFShapes are instanced only once and can be refenced by their `src`
 */
export function writeGLTFComponents(components: ComponentState['data']): string {
  const gltfLookup: string[] = []
  let out = 'const gltfLookup = {\n'

  for (let key in components) {
    const component = components[key]
    if (component.type === ComponentType.GLTFShape) {
      const { src } = component.data
      if (!gltfLookup.includes(src)) {
        gltfLookup.push(src)
        out += `\t'${src}': new GLTFShape('${src}'),\n`
      }
    }
  }

  out += '};\n'

  return out
}

/**
 * Generates a script where all entities are instanced and reference their respective previously instanced components
 */
export function writeEntities(entities: EntityState['data'], components: ComponentState['data']): string {
  let out = ''

  for (let key in entities) {
    const entity = entities[key]
    const entityVar = getVarName()

    out += `const ${entityVar} = new Entity();\n`

    for (let j = 0; j < entity.components.length; j++) {
      const component = components[entity.components[j]]
      if (component.type === ComponentType.GLTFShape) {
        const gltf = component as ComponentDefinition<ComponentType.GLTFShape>
        out += `${entityVar}.set(gltfLookup['${gltf.data.src}']);\n`
      } else if (component.type === ComponentType.Transform) {
        const transform = component as ComponentDefinition<ComponentType.Transform>
        const { position, rotation } = transform.data
        out += `${entityVar}.set(new Transform({
          position: new Vector3(${position.x}, ${position.y}, ${position.z}),
          rotation: Quaternion.Euler(${rotation.x}, ${rotation.y}, ${rotation.z})
        }));\n`
      }
    }

    out += `engine.addEntity(${entityVar});\n`
  }

  return out
}
