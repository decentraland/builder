import { Dispatch } from 'redux'
import { DeploymentStatus, Deployment } from 'modules/deployment/types'
import { queryRemoteCID, QueryRemoteCIDAction } from 'modules/deployment/actions'

export type Props = {
  className?: string
  status: DeploymentStatus
  deployment: Deployment | null
  projectId: string
  onQueryRemoteCID: typeof queryRemoteCID
}

export type OwnProps = Pick<Props, 'projectId'>

export type MapStateProps = Pick<Props, 'status' | 'deployment'>

export type MapDispatchProps = Pick<Props, 'onQueryRemoteCID'>

export type MapDispatch = Dispatch<QueryRemoteCIDAction>
