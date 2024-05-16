import { Deployment } from 'modules/deployment/types'
import { ENS } from 'modules/ens/types'

export type Props = {
  deploymentsByWorlds: Record<string, Deployment>
  ens: ENS
}
