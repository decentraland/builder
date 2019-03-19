import uuidv4 from 'uuid/v4'
import { put, takeLatest, select } from 'redux-saga/effects'

import { getId } from 'modules/user/selectors'
import { setUserId } from 'modules/user/actions'
import { OPEN_EDITOR } from 'modules/editor/actions'

export function* userSaga() {
  yield takeLatest(OPEN_EDITOR, handleOpenEditor)
}

function* handleOpenEditor() {
  const id: ReturnType<typeof getId> = yield select(getId)

  if (!id) {
    const newId = uuidv4()
    yield put(setUserId(newId))
  }
}
