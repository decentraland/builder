import { action } from 'typesafe-actions'

// Subscribe to Newsletter

export const SUBSCRIBE_TO_NEWSLETTER_REQUEST = '[Request] Subscribe to newsletter'
export const SUBSCRIBE_TO_NEWSLETTER_SUCCESS = '[Success] Subscribe to newsletter'
export const SUBSCRIBE_TO_NEWSLETTER_FAILURE = '[Failure] Subscribe to newsletter'

export const subscribeToNewsletterRequest = (email: string, source: string) => action(SUBSCRIBE_TO_NEWSLETTER_REQUEST, { email, source })
export const subscribeToNewsletterSuccess = () => action(SUBSCRIBE_TO_NEWSLETTER_SUCCESS, {})
export const subscribeToNewsletterFailure = (email: string, error: string) => action(SUBSCRIBE_TO_NEWSLETTER_FAILURE, { email, error })

export type SubscribeToNewsletterRequestAction = ReturnType<typeof subscribeToNewsletterRequest>
export type SubscribeToNewsletterSuccessAction = ReturnType<typeof subscribeToNewsletterSuccess>
export type SubscribeToNewsletterFailureAction = ReturnType<typeof subscribeToNewsletterFailure>
