import { RootState } from './types'

export const migrations = {
  '2': (data: RootState) => {
    debugger
    return {
      ...data,
      project: {
        ...data.project,
        loading: []
      }
    }
  }
}
