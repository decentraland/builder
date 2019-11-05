import { PayloadAction } from 'typesafe-actions'
import { put } from 'redux-saga/effects'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'

import { builder } from 'lib/api/builder'
import { debounceByKey, throttle } from 'lib/debounce'

export const SAVE_DEBOUNCE = 4000

export const THUMBNAIL_THROTTLE = 30000

export const saveProjectDebounce = debounceByKey((project: Project, scene: Scene) => builder.saveProject(project, scene), SAVE_DEBOUNCE)

export function saveProject (key: string, project: Project, scene: Scene, debounce: boolean = true) {
  if (debounce) {
    return saveProjectDebounce(key, project, scene)
  } else {
    return builder.saveProject(project, scene)
  }
}

export const saveThumbnail = throttle((project: Project) => builder.saveProjectThumbnail(project), THUMBNAIL_THROTTLE)

export function* forEach<T>(ids: string[], data: DataByKey<T>, action: (element: T) => PayloadAction<any, any>) {
  for (const id of ids) {
    const element = data[id]
    if (element) {
      yield put(action(element))
    }
  }
}
