import { DeploymentStatus, Deployment } from 'modules/deployment/types'

export type Props = {
  status: DeploymentStatus
  deployment: Deployment | null
}

export type MapStateProps = Pick<Props, 'status' | 'deployment'>
