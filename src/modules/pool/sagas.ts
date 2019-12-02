import { put, call, takeLatest } from 'redux-saga/effects'
import { LikePoolRequestAction, likePoolFailure, likePoolSuccess, LIKE_POOL_REQUEST } from './actions';
import { builder } from 'lib/api/builder';
import { stackHandle } from './utils';

export function* poolSaga() {
  yield takeLatest(LIKE_POOL_REQUEST, handlePoolLike)
}

// export const handlePoolLike = stackPoolLike()
export const handlePoolLike = stackHandle(
  function* handleSinglePool(action: LikePoolRequestAction) {
    const { pool, like } = action.payload
    try {
      yield call(() => builder.likePool(pool, like))
      yield put(likePoolSuccess())
    } catch (e) {
      yield put(likePoolFailure(e.message))
    }
  },
  function mergeLikeAction(currentAction: LikePoolRequestAction, nextAction: LikePoolRequestAction | null, newAction: LikePoolRequestAction) {
    if (nextAction === null && currentAction.payload.like !== newAction.payload.like) {
      return newAction
    } else if (nextAction && nextAction.payload.like !== nextAction.payload.like) {
      return null
    } else {
      return nextAction
    }
  },
  function identifyLikeAction(action: LikePoolRequestAction) {
    return action.payload.pool
  }
)
