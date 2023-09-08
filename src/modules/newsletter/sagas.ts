import { put, call, takeLatest } from 'redux-saga/effects'
import { BuilderAPI } from 'lib/api/builder'
import {
  SUBSCRIBE_TO_NEWSLETTER_REQUEST,
  SubscribeToNewsletterRequestAction,
  subscribeToNewsletterFailure,
  subscribeToNewsletterSuccess
} from './action'

export function* newsletterSagas(builderClient: BuilderAPI) {
  yield takeLatest(SUBSCRIBE_TO_NEWSLETTER_REQUEST, handleSubscribeToNewsletter)

  function* handleSubscribeToNewsletter(action: SubscribeToNewsletterRequestAction) {
    const { email, source } = action.payload

    try {
      yield call([builderClient, 'subscribeToNewsletter'], email, source)
      yield put(subscribeToNewsletterSuccess())
    } catch (e) {
      yield put(subscribeToNewsletterFailure(email, e.message))
    }
  }
}
