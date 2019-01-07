import { ActionType } from 'typesafe-actions'
import * as actions from 'modules/project/actions'

export type ProjectActions = ActionType<typeof actions>

export interface Project {
  id: string
  title: string
  description: string
  ownerEmail: string
  parcels: { x: number; y: number }[]
  scene_id: string
}
