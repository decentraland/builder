import { addMappings } from './ISSUE-485'
import { RootState } from 'modules/common/types'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Project } from 'modules/project/types'
import { Deployment } from 'modules/deployment/types'
import { toProjectCloudSchema, toDeploymentCloudSchema, addScale, addEntityName, addAssets, removeScriptSrc } from './utils'

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
    for (const scene of Object.values((state && state.scene && state.scene.present && state.scene.present.data) || {})) {
      // mutation ahead
      addMappings(scene)
    }
    return state
  },
  '4': (state: RootState) => {
    const shouldMigrateProjects = !!state.project && !!state.project.data
    const shouldMigrateDeployments = !!state.deployment && !!state.deployment.data
    /* tslint:disable */
    return {
      ...state,
      project: shouldMigrateProjects
        ? {
            ...state.project,
            data: Object.keys(state.project.data).reduce<DataByKey<Project>>((data, id) => {
              data[id] = toProjectCloudSchema(state.project.data[id])
              return data
            }, {})
          }
        : state.project,
      deployment: shouldMigrateDeployments
        ? {
            ...state.deployment,
            data: Object.keys(state.deployment.data).reduce<DataByKey<Deployment>>((data, id) => {
              data[id] = toDeploymentCloudSchema(id, state.deployment.data[id])
              return data
            }, {})
          }
        : state.deployment
    }
    /* tslint:enable */
  },
  '5': (state: RootState) => {
    for (const scene of Object.values((state && state.scene && state.scene.present && state.scene.present.data) || {})) {
      // mutation ahead
      addScale(scene)
    }
    return state
  },
  '6': (state: RootState) => {
    for (let sceneId in state.scene.present.data) {
      const scene = state.scene.present.data[sceneId]
      addEntityName(scene)
    }

    return state
  },
  '7': (state: RootState) => {
    for (let sceneId in state.scene.present.data) {
      const scene = state.scene.present.data[sceneId]
      addAssets(scene)
    }
    return state
  },
  '8': (state: RootState) => {
    for (let sceneId in state.scene.present.data) {
      const scene = state.scene.present.data[sceneId]
      removeScriptSrc(scene)
    }
    return state
  }
}
