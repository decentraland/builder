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
  onUnpublishWorld: ActionFunction<typeof clearDeploymentRequest>
}
