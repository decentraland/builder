import { all, takeLatest, put, select, take, race } from 'redux-saga/effects'
import { getLocation, LOCATION_CHANGE, push, replace } from 'connected-react-router'
import { locations } from 'routing/locations'
import { LOGIN_SUCCESS, LoginSuccessAction } from 'modules/identity/actions'
import { CLAIM_NAME_SUCCESS, SetENSContentSuccessAction, SET_ENS_CONTENT_SUCCESS } from 'modules/ens/actions'
import {
  FetchCollectionsSuccessAction,
  FetchCollectionsFailureAction,
  FETCH_COLLECTIONS_FAILURE,
  FETCH_COLLECTIONS_SUCCESS
} from 'modules/collection/actions'
import { getCollectionsByContractAddress } from 'modules/collection/selectors'
import { RedirectTo, RedirectToTypes } from './types'
import { redirectToFailure, redirectToRequest, RedirectToRequestAction, redirectToSuccess, REDIRECT_TO_REQUEST } from './actions'

export function* locationSaga() {
  yield all([
    takeLatest(LOGIN_SUCCESS, handleLoginSuccess),
    takeLatest(SET_ENS_CONTENT_SUCCESS, handleSetENSContentSuccess),
    takeLatest(CLAIM_NAME_SUCCESS, goToActivity),
    takeLatest(LOCATION_CHANGE, handleLocationChange),
    takeLatest(REDIRECT_TO_REQUEST, handleRedirectToRequest)
  ])
}

function* handleLoginSuccess(_action: LoginSuccessAction) {
  const location: ReturnType<typeof getLocation> = yield select(getLocation)
  if (location.pathname === locations.signIn()) {
    yield put(replace(locations.root()))
  }
}

function* handleSetENSContentSuccess(action: SetENSContentSuccessAction) {
  const { land } = action.payload
  if (!land) {
    yield goToActivity()
  }
}

function* goToActivity() {
  yield put(replace(locations.activity()))
}

export function* handleLocationChange() {
  const {
    query: { redirectTo }
  } = yield select(getLocation)

  if (redirectTo) {
    yield put(redirectToRequest(redirectTo))
  }
}

export function* handleRedirectToRequest(action: RedirectToRequestAction) {
  const { redirectTo: encodedRedirectTo } = action.payload

  function* fail(error: string): any {
    yield put(redirectToFailure(encodedRedirectTo, error))
  }

  try {
    const redirectTo: RedirectTo = JSON.parse(decodeURIComponent(encodedRedirectTo))

    switch (redirectTo.type) {
      case RedirectToTypes.COLLECTION_DETAIL_BY_CONTRACT_ADDRESS:
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
            yield put(push(locations.collectionDetail(collection.id)))
            yield put(redirectToSuccess(encodedRedirectTo))
          } else {
            yield
            yield fail(`Collection with contract address ${contractAddress} not found`)
          }
        }

        if (failure) {
          yield fail(`Could not get collections. ${failure.payload.error}`)
        }
        break
      default:
        yield fail(`Invalid redirect to type "${redirectTo.type}"`)
    }
  } catch (error) {
    yield fail(error.message)
  }
}
