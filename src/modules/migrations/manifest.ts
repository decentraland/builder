import { Manifest } from 'modules/project/types'
import { addMappings } from './ISSUE-485'
import { toProjectCloudSchema, addScale, addEntityName } from './utils'
import { Migration } from './types'

export const migrations: Migration<Manifest> = {
  '2': input => {
    addMappings(input.scene)
    return input
  },
  '3': input => {
    if (input.project) {
      input.project = toProjectCloudSchema(input.project)
    }
    addMappings(input.scene)
    return input
  },
  '4': input => {
    addScale(input.scene)
    return input
  },
  '5': input => {
    addEntityName(input.scene)
    return input
  }
}
