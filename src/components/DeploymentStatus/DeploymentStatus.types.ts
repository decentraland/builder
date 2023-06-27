import { DeploymentStatus } from 'modules/deployment/types'

export type Props = {
  className?: string
  status: DeploymentStatus | null
  projectId: string
  type?: 'project' | 'public' | 'pool'
}

export type OwnProps = Pick<Props, 'projectId'>

export type MapStateProps = Pick<Props, 'status'>
