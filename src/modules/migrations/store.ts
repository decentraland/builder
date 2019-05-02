import { addMappings } from './ISSUE-485'
import { RootState } from 'modules/common/types'

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
  }
}
