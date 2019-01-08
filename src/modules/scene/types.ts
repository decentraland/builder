import { AnyComponent } from 'modules/component/types'
import { EntityDefinition } from 'modules/entity/types'

export type SceneDefinition = {
  id: string
  metrics: {
    triangles: number
    materials: number
    bodies: number
    entities: number
    textures: number
    height: number
  }
  entities: Record<string, EntityDefinition>
  components: Record<string, AnyComponent>
}

export type EntityDefinition = {
  id: string
  components: string[] // array of IDs pointing to components
  // TODO: handle children?
}
