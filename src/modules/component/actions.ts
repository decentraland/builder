import { action } from 'typesafe-actions'
import { AnyComponent } from './types'

// Add component

export const ADD_COMPONENT = 'Add component'

export const addComponent = (component: AnyComponent) => action(ADD_COMPONENT, { component })

export type AddComponentAction = ReturnType<typeof addComponent>
