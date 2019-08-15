import { Dispatch } from 'redux'
import { retrySync, RetrySyncAction } from 'modules/sync/actions'
import { dismissSyncedToast, dismissSignInToast, DismissSyncedToastAction, DismissSignInToastAction } from 'modules/ui/dashboard/actions'

export type Props = {
  syncCount: number
  errorCount: number
  isLoggedIn: boolean
  didDismissSignInToast: boolean
  didDismissSyncedToast: boolean
  onRetry: typeof retrySync
  onDismissSyncedToast: typeof dismissSyncedToast
  onDismissSignInToast: typeof dismissSignInToast
}

export type State = {
  isSynced: boolean
}

export type MapStateProps = Pick<Props, 'syncCount' | 'errorCount' | 'isLoggedIn' | 'didDismissSignInToast' | 'didDismissSyncedToast'>
export type MapDispatchProps = Pick<Props, 'onRetry' | 'onDismissSyncedToast' | 'onDismissSignInToast'>
export type MapDispatch = Dispatch<RetrySyncAction | DismissSyncedToastAction | DismissSignInToastAction>
