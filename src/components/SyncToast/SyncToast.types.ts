import { Dispatch } from 'redux'
import { retrySync, RetrySyncAction } from 'modules/sync/actions'

export type Props = {
  syncCount: number
  errorCount: number
  onRetry: typeof retrySync
}

export type State = {
  isSynced: boolean
}

export type MapStateProps = Pick<Props, 'syncCount' | 'errorCount'>
export type MapDispatchProps = Pick<Props, 'onRetry'>
export type MapDispatch = Dispatch<RetrySyncAction>
