import { put, call, takeLatest } from 'redux-saga/effects'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import {
  LikePoolRequestAction,
  likePoolFailure,
  likePoolSuccess,
  LIKE_POOL_REQUEST,
  LoadPoolsRequestAction,
  loadPoolsFailure,
  loadPoolsSuccess,
  LOAD_POOLS_REQUEST
} from './actions'
import { BuilderAPI } from 'lib/api/builder'
import { stackHandle, getPagination } from './utils'
import { Pool, RECORDS_PER_PAGE } from './types'

export function* poolSaga(builder: BuilderAPI) {
  const handlePoolLike = stackHandle(
    function* handleSinglePool(action: LikePoolRequestAction) {
      const { pool, like } = action.payload
      try {
        yield call(() => builder.likePool(pool, like))
        yield put(likePoolSuccess())
      } catch (e) {
        yield put(likePoolFailure(e.message))
      }
    },
    function mergeLikeAction(
      currentAction: LikePoolRequestAction,
      nextAction: LikePoolRequestAction | null,
      newAction: LikePoolRequestAction
    ) {
      if (nextAction === null && currentAction.payload.like !== newAction.payload.like) {
        return newAction
      } else if (nextAction && nextAction.payload.like !== newAction.payload.like) {
        return null
      } else {
        return nextAction
      }
    },
    function identifyLikeAction(action: LikePoolRequestAction) {
      return action.payload.pool
    }
  )

  yield takeLatest(LIKE_POOL_REQUEST, handlePoolLike)
  yield takeLatest(LOAD_POOLS_REQUEST, handleLoadPools)

  function* handleLoadPools(action: LoadPoolsRequestAction) {
    const { group, page, sortBy, sortOrder, ethAddress } = action.payload

    try {
      const { offset, limit } = getPagination(page || 1, RECORDS_PER_PAGE)
      const { items, total }: { items: Pool[]; total: number } = yield call(() =>
        builder.fetchPoolsPage({ offset, limit, group, eth_address: ethAddress, sort_by: sortBy, sort_order: sortOrder })
      )
      const records: ModelById<Pool> = {}
      for (const item of items) {
        records[item.id] = item
      }
      yield put(loadPoolsSuccess(records, total))
    } catch (e) {
      yield put(loadPoolsFailure(e.message))
    }
  }
}
