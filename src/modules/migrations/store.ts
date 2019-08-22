import { addMappings } from './ISSUE-485'
import { RootState } from 'modules/common/types'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Project } from 'modules/project/types'
import { Deployment } from 'modules/deployment/types'
import { toProjectCloudSchema, toDeploymentCloudSchema } from './utils'

export const migrations = {
  '2': (state: RootState) => {
    return {
      ...state,
      project: {
        ...state.project,
        loading: []
      }
    }
  },
  '3': (state: RootState) => {
    for (const scene of Object.values(state.scene.present.data)) {
      // mutation ahead
      addMappings(scene)
    }
    return state
  },
  '4': (state: RootState) => {
    return {
      ...state,
      project: {
        ...state.project,
        data: Object.keys(state.project.data).reduce<DataByKey<Project>>((data, id) => {
          data[id] = toProjectCloudSchema(state.project.data[id])
          return data
        }, {})
      },
      deployment: {
        ...state.deployment,
        data: Object.keys(state.deployment.data).reduce<DataByKey<Deployment>>((data, id) => {
          data[id] = toDeploymentCloudSchema(id, state.deployment.data[id])
          return data
        }, {})
      }
    }
  }
}
