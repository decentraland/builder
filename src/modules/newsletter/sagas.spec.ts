import { expectSaga } from 'redux-saga-test-plan'
import { throwError } from 'redux-saga-test-plan/providers'
import { call } from 'redux-saga/effects'
import { BuilderAPI } from 'lib/api/builder'
import { Authorization } from 'lib/api/auth'
import { RootStore } from 'modules/common/types'
import { subscribeToNewsletterFailure, subscribeToNewsletterRequest, subscribeToNewsletterSuccess } from './action'
import { newsletterSagas } from './sagas'

const mockUrl = 'https://mock.url.xyz'
const mockAuthorization: Authorization = new Authorization({} as RootStore)
const mockBuilder = new BuilderAPI(mockUrl, mockAuthorization)

describe('newsletterSagas', () => {
  const mockEmail = 'test@example.com'
  const mockSource = 'Builder emote creator'

  it('handles successful newsletter subscription', () => {
    return expectSaga(newsletterSagas, mockBuilder)
      .provide([[call([mockBuilder, 'subscribeToNewsletter'], mockEmail, mockSource), undefined]])
      .put(subscribeToNewsletterSuccess())
      .dispatch(subscribeToNewsletterRequest(mockEmail, mockSource))
      .silentRun()
  })

  it('handles failed newsletter subscription', () => {
    const mockError = new Error('Subscription failed!')

    return expectSaga(newsletterSagas, mockBuilder)
      .provide([[call([mockBuilder, 'subscribeToNewsletter'], mockEmail, mockSource), throwError(mockError)]])
      .put(subscribeToNewsletterFailure(mockEmail, mockError.message))
      .dispatch(subscribeToNewsletterRequest(mockEmail, mockSource))
      .silentRun()
  })
})
