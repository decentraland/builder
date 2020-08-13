import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Land } from 'modules/land/types'
import { Deployment } from 'modules/deployment/types'

export type Props = {
  land: Land
  deployments: Deployment[]
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'deployments'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
export type OwnProps = Pick<Props, 'land'>
