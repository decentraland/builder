import { addMappings } from './ISSUE-485'
import { RootState } from 'modules/common/types'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Project } from 'modules/project/types'
import { INITIAL_STATE as DEPLOYMENT_INITIAL_STATE } from 'modules/deployment/reducer'
import { RESCUE_ITEMS_SUCCESS } from 'modules/item/actions'
import {
  toProjectCloudSchema,
  addScale,
  addEntityName,
  addAssets,
  removeScriptSrc,
  sanitizeEntityName,
  sanitizeEntityName2,
  dedupeEntityName,
  replaceUserIdWithEthAddress
} from './utils'

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
        : state.project
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
  },
  '9': (state: RootState) => {
    for (let sceneId in state.scene.present.data) {
      const scene = state.scene.present.data[sceneId]
      sanitizeEntityName(scene)
    }
    return state
  },
  '10': (state: RootState) => {
    for (let sceneId in state.scene.present.data) {
      const scene = state.scene.present.data[sceneId]
      sanitizeEntityName2(scene)
    }
    return state
  },
  '11': (state: RootState) => {
    for (let sceneId in state.scene.present.data) {
      const scene = state.scene.present.data[sceneId]
      dedupeEntityName(scene)
    }
    return state
  },
  '12': (state: RootState) => {
    for (let projectId in state.project.data) {
      const project = state.project.data[projectId]
      replaceUserIdWithEthAddress(project)
    }
    return state
  },
  '13': (state: RootState) => {
    // auth0 migration
    const needsMigration = !!(state && state.ui && state.ui.dashboard && state.ui.dashboard.didSync)
    if (needsMigration) {
      state.ui.dashboard.needsMigration = needsMigration
    }
    return state
  },
  '14': (state: RootState) => {
    // remove deployments from local storage, since now we always fetch them from the catalyst
    const isDirty = !!(state.deployment && state.deployment.data && Object.keys(state.deployment.data).length > 0)
    if (isDirty) {
      state.deployment = DEPLOYMENT_INITIAL_STATE
    }
    return state
  },
  '15': (state: RootState) => {
    // update RESCUE_ITEMS_SUCCESS transaction payload to match the new one
    return {
      ...state,
      transaction: {
        ...state.transaction,
        data: state.transaction.data.map(tx => {
          const { collectionId, collectionName, count } = tx.payload
          return tx.actionType === RESCUE_ITEMS_SUCCESS
            ? { ...tx, payload: { collection: { id: collectionId, name: collectionName }, count } }
            : tx
        })
      }
    }
  }
}
