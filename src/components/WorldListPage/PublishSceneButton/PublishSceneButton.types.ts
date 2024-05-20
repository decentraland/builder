import { Deployment } from 'modules/deployment/types'
import { ENS } from 'modules/ens/types'
import { Project } from 'modules/project/types'

export type Props = {
  deploymentsByWorlds: Record<string, Deployment>
  ens: ENS
  projects: Project[]
  onEditScene?: (ens: ENS) => void
  onUnpublishScene?: (ens: ENS) => void
  onPublishScene?: () => void
}
