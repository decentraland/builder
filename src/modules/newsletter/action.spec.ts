import {
  SUBSCRIBE_TO_NEWSLETTER_FAILURE,
  SUBSCRIBE_TO_NEWSLETTER_REQUEST,
  SUBSCRIBE_TO_NEWSLETTER_SUCCESS,
  subscribeToNewsletterFailure,
  subscribeToNewsletterRequest,
  subscribeToNewsletterSuccess
} from './action'

const email = 'anEmail@dcl.com'
const mockSource = 'Builder emote creator'
const error = 'an error'

describe('when creating the action to request the subscription to the newsletter', () => {
  it('should return an action signaling the request to subscribe to the newsletter', () => {
    expect(subscribeToNewsletterRequest(email, mockSource)).toEqual({
      error: undefined,
      meta: undefined,
      type: SUBSCRIBE_TO_NEWSLETTER_REQUEST,
      payload: {
        email,
        source: mockSource
      }
    })
  })
})

describe('when creating the action to signal the success of subscribing to the newsletter', () => {
  it('should return an action signaling the success of subscribing to the newsletter', () => {
    expect(subscribeToNewsletterSuccess()).toEqual({
      error: undefined,
      meta: undefined,
      type: SUBSCRIBE_TO_NEWSLETTER_SUCCESS,
      payload: {}
    })
  })
})

describe('when creating the action to signal the failure of subscribing to the newsletter', () => {
  it('should return an action signaling the failure of subscribing to the newsletter', () => {
    expect(subscribeToNewsletterFailure(email, error)).toEqual({
      error: undefined,
      meta: undefined,
      type: SUBSCRIBE_TO_NEWSLETTER_FAILURE,
      payload: {
        email,
        error
      }
    })
  })
})
