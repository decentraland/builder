import { all } from 'redux-saga/effects'
import { dashboardSaga } from './dashboard/sagas'

export function* uiSaga() {
  yield all([dashboardSaga()])
}
