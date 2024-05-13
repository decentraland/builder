import { Dispatch } from 'redux'
import { Deployment } from 'modules/deployment/types'
import { ENS, ENSError } from 'modules/ens/types'
import { Project } from 'modules/project/types'
import { clearDeploymentRequest } from 'modules/deployment/actions'

export type Props = {
  items: ENS[]
  projects: Project[]
  deploymentsByWorlds: Record<string, Deployment>
  loading: boolean
  error: ENSError | null
  onNavigate: (path: string) => void
  onUnpublishWorld: typeof clearDeploymentRequest
}

export type MapStateProp = Pick<Props, 'items' | 'deploymentsByWorlds' | 'projects' | 'loading' | 'error'>

export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onUnpublishWorld'>
export type MapDispatch = Dispatch
