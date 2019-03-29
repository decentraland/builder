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
  },
  '3': (data: RootState) => {
    const { contest, ...newData } = data
    localStorage.removeItem('builder-incentive-banner')
    return newData as RootState
  }
}
