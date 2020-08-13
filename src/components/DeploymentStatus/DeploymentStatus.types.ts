import { Dispatch } from 'redux'
import { DeploymentStatus, Deployment } from 'modules/deployment/types'

export type Props = {
  className?: string
  status: DeploymentStatus | null
  deployment: Deployment | null
  projectId: string
  type?: 'project' | 'public' | 'pool'
}

export type OwnProps = Pick<Props, 'projectId'>

export type MapStateProps = Pick<Props, 'status' | 'deployment'>

export type MapDispatchProps = {}

export type MapDispatch = Dispatch
