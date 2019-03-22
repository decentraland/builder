import { RootState } from './types'

export const migrations = {
  '2': (data: RootState) => {
    return {
      ...data,
      project: {
        ...data.project,
        loading: []
      }
    }
  }
}
