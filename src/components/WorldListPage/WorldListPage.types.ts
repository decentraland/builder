import { clearDeploymentRequest } from 'modules/deployment/actions'
import { Deployment } from 'modules/deployment/types'
import { ENS } from 'modules/ens/types'
import { fetchContributableNamesRequest, fetchENSListRequest } from 'modules/ens/actions'
import { Project } from 'modules/project/types'
import { WorldPermissions, WorldsWalletStats } from 'lib/api/worlds'
import { WorldsYourStorageModalMetadata } from 'components/Modals/WorldsYourStorageModal/WorldsYourStorageModal.types'

export enum SortBy {
  DESC = 'DESC',
  ASC = 'ASC'
}

export type Props = {
  error?: string
  ensList: ENS[]
  externalNames: ENS[]
  deploymentsByWorlds: Record<string, Deployment>
  projects: Project[]
  isLoggedIn: boolean
  worldsPermissions: Record<string, WorldPermissions>
  isLoading: boolean
  worldsWalletStats?: WorldsWalletStats
  isConnected: boolean
  isWorldContributorEnabled: boolean
  onOpenYourStorageModal: (metadata: WorldsYourStorageModalMetadata) => void
  onOpenPermissionsModal: (worldName: string, isCollaboratorsTabShown?: boolean) => void
  onOpenWorldsForENSOwnersAnnouncementModal: () => void
  onUnpublishWorld: ActionFunction<typeof clearDeploymentRequest>
  onFetchContributableNames: ActionFunction<typeof fetchContributableNamesRequest>
  onFetchENSList: ActionFunction<typeof fetchENSListRequest>
  ensTotal: number
}

export type State = {
  page: number
  sortBy: SortBy
}
