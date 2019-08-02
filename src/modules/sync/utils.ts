import { Action } from 'redux-actions'
import { put } from 'redux-saga/effects'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { api } from 'lib/api'
import { debounceByKey } from 'lib/debounce'

export const SAVE_DEBOUNCE = 2000

export const saveProject = debounceByKey((project: Project, scene: Scene) => api.saveProject(project, scene), SAVE_DEBOUNCE)

export function* forEach<T>(ids: string[], data: DataByKey<T>, action: (element: T) => Action<any>) {
  for (const id of ids) {
    const element = data[id]
    if (element) {
      yield put(action(element))
    }
  }
}
