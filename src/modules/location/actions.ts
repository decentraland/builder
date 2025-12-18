import { action } from 'typesafe-actions'
import { Location } from 'history'

export const LOCATION_CHANGE = '[Location] Change'

export const locationChange = (location: Location) => action(LOCATION_CHANGE, { location })
export type LocationChangeAction = ReturnType<typeof locationChange>

export const REDIRECT_TO_REQUEST = '[Request] Redirect request'
export const REDIRECT_TO_SUCCESS = '[Success] Redirect success'
export const REDIRECT_TO_FAILURE = '[Failure] Redirect failure'

export const redirectToRequest = (redirectTo: string) => action(REDIRECT_TO_REQUEST, { redirectTo })
export const redirectToSuccess = (redirectTo: string) => action(REDIRECT_TO_SUCCESS, { redirectTo })
export const redirectToFailure = (redirectTo: string, error: string) => action(REDIRECT_TO_FAILURE, { redirectTo, error })

export type RedirectToRequestAction = ReturnType<typeof redirectToRequest>
export type RedirectToSuccessAction = ReturnType<typeof redirectToSuccess>
export type RedirectToFailureAction = ReturnType<typeof redirectToFailure>
