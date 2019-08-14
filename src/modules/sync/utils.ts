import { PayloadAction } from 'typesafe-actions'
import { put } from 'redux-saga/effects'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { api } from 'lib/api'
import { debounceByKey, throttle } from 'lib/debounce'

export const SAVE_DEBOUNCE = 4000

export const THUMBNAIL_THROTTLE = 30000

export const saveProject = debounceByKey((project: Project, scene: Scene) => api.saveProject(project, scene), SAVE_DEBOUNCE)

export const saveThumbnail = throttle((project: Project) => api.saveThumbnail(project), THUMBNAIL_THROTTLE)

export function* forEach<T>(ids: string[], data: DataByKey<T>, action: (element: T) => PayloadAction<any, any>) {
  for (const id of ids) {
    const element = data[id]
    if (element) {
      yield put(action(element))
    }
  }
}
