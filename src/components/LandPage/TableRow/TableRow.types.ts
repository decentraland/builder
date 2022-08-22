import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Land, Rental } from 'modules/land/types'
import { Deployment } from 'modules/deployment/types'

export type Props = {
  land: Land
  deployments: Deployment[]
  rental: Rental | null
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'deployments' | 'rental'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
export type OwnProps = Pick<Props, 'land'>
