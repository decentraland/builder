import { action } from 'typesafe-actions'
import { EntityDefinition } from './types'

// Add entitu

export const ADD_ENTITY = 'Add entity'

export const addEntity = (entity: EntityDefinition) => action(ADD_ENTITY, { entity })

export type AddEntityAction = ReturnType<typeof addEntity>
