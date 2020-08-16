import { Dispatch } from 'redux'
import { DeploymentStatus, Deployment } from 'modules/deployment/types'
import { Project } from 'modules/project/types'

export type Props = {
  className?: string
  status: DeploymentStatus | null
  deployments: Deployment[]
  projectId: string
  project: Project | null
  type?: 'project' | 'public' | 'pool'
}

export type OwnProps = Pick<Props, 'projectId'>

export type MapStateProps = Pick<Props, 'status' | 'project' | 'deployments'>

export type MapDispatchProps = {}

export type MapDispatch = Dispatch
