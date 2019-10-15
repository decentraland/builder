import { Dispatch } from 'redux'
import { login, LoginAction } from 'modules/auth/actions'
import { retrySync, RetrySyncAction } from 'modules/sync/actions'
import { dismissSyncedToast, dismissSignInToast, DismissSyncedToastAction, DismissSignInToastAction } from 'modules/ui/dashboard/actions'

export type Props = {
  syncCount: number
  errorCount: number
  projectCount: number
  isLoggedIn: boolean
  didDismissSignInToast: boolean
  didDismissSyncedToast: boolean
  onRetry: typeof retrySync
  onLogin: typeof login
  onDismissSyncedToast: typeof dismissSyncedToast
  onDismissSignInToast: typeof dismissSignInToast
}

export type State = {
  isSynced: boolean
}

export type MapStateProps = Pick<
  Props,
  'syncCount' | 'errorCount' | 'projectCount' | 'isLoggedIn' | 'didDismissSignInToast' | 'didDismissSyncedToast'
>
export type MapDispatchProps = Pick<Props, 'onRetry' | 'onDismissSyncedToast' | 'onDismissSignInToast' | 'onLogin'>
export type MapDispatch = Dispatch<RetrySyncAction | DismissSyncedToastAction | DismissSignInToastAction | LoginAction>
