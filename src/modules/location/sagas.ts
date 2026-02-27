import { all, takeLatest, put, select, take, race, getContext } from 'redux-saga/effects'
import { History } from 'history'
import { LOCATION_CHANGE } from './actions'
import { isErrorWithMessage } from 'decentraland-dapps/dist/lib/error'
import { locations } from 'routing/locations'
import { LOGIN_SUCCESS, LoginSuccessAction } from 'modules/identity/actions'
import { SetENSContentSuccessAction, SET_ENS_CONTENT_SUCCESS } from 'modules/ens/actions'
import {
  FetchCollectionsSuccessAction,
  FetchCollectionsFailureAction,
  FETCH_COLLECTIONS_FAILURE,
  FETCH_COLLECTIONS_SUCCESS
} from 'modules/collection/actions'
import { getCollectionsByContractAddress } from 'modules/collection/selectors'
import { redirectToFailure, redirectToRequest, RedirectToRequestAction, redirectToSuccess, REDIRECT_TO_REQUEST } from './actions'
import { RedirectTo, RedirectToTypes } from './types'

export function* locationSaga() {
  yield all([
    takeLatest(LOGIN_SUCCESS, handleLoginSuccess),
    takeLatest(SET_ENS_CONTENT_SUCCESS, handleSetENSContentSuccess),
    takeLatest(LOCATION_CHANGE, handleLocationChange),
    takeLatest(REDIRECT_TO_REQUEST, handleRedirectToRequest)
  ])
}

function* handleLoginSuccess(_action: LoginSuccessAction) {
  const history: History = yield getContext('history')
  const { pathname, search } = history.location

  if (pathname === locations.signIn()) {
    const redirectTo = new URLSearchParams(search).get('redirectTo')
    if (redirectTo) {
      history.push(decodeURIComponent(redirectTo))
    } else {
      history.push(locations.root())
    }
  }
}

function* handleSetENSContentSuccess(action: SetENSContentSuccessAction) {
  const history: History = yield getContext('history')
  const { land } = action.payload
  if (!land) {
    history.replace(locations.activity())
  }
}

export function* handleLocationChange() {
  const history: History = yield getContext('history')
  const redirectTo = new URLSearchParams(history.location.search).get('redirectTo')

  if (redirectTo) {
    yield put(redirectToRequest(redirectTo))
  }
}

export function* handleRedirectToRequest(action: RedirectToRequestAction) {
  const { redirectTo: encodedRedirectTo } = action.payload
  const history: History = yield getContext('history')

  function* fail(error: string): any {
    yield put(redirectToFailure(encodedRedirectTo, error))
  }

  try {
    const redirectTo: RedirectTo = JSON.parse(decodeURIComponent(encodedRedirectTo))

    switch (redirectTo.type) {
      case RedirectToTypes.COLLECTION_DETAIL_BY_CONTRACT_ADDRESS: {
        const { success, failure }: { success?: FetchCollectionsSuccessAction; failure?: FetchCollectionsFailureAction } = yield race({
          success: take(FETCH_COLLECTIONS_SUCCESS),
          failure: take(FETCH_COLLECTIONS_FAILURE)
        })

        if (success) {
          const collectionsByContractAddress: ReturnType<typeof getCollectionsByContractAddress> = yield select(
            getCollectionsByContractAddress
          )

          const { contractAddress } = redirectTo.data
          const collection = collectionsByContractAddress[contractAddress]

          if (collection) {
            yield put(redirectToSuccess(encodedRedirectTo))
            history.push(locations.collectionDetail(collection.id))
          } else {
            yield
            yield fail(`Collection with contract address ${contractAddress} not found`)
          }
        }

        if (failure) {
          yield fail(`Could not get collections. ${failure.payload.error}`)
        }
        break
      }
      default:
        yield fail(`Invalid redirect to type "${redirectTo.type as unknown as string}"`)
    }
  } catch (error) {
    yield fail(isErrorWithMessage(error) ? error.message : 'Unknown error')
  }
}
