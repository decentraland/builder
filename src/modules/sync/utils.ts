import { Action } from 'redux-actions'
import { put } from 'redux-saga/effects'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'

export function* forEach<T>(ids: string[], data: DataByKey<T>, action: (element: T) => Action<any>) {
  for (const id of ids) {
    const element = data[id]
    if (element) {
      yield put(action(element))
    }
  }
}
