import { Dispatch } from 'redux'
import { clearDeploymentRequest } from 'modules/deployment/actions'
import { Deployment } from 'modules/deployment/types'
import { ENS } from 'modules/ens/types'
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
  getProfiles: (worldName: string) => void
  onUnpublishWorld: typeof clearDeploymentRequest
  onFetchContributableNames: () => void
  onFetchENSList: (first: number, skip: number) => void
  ensTotal: number
}

export type State = {
  page: number
  sortBy: SortBy
}

export type MapStateProps = Pick<
  Props,
  | 'ensList'
  | 'externalNames'
  | 'deploymentsByWorlds'
  | 'isLoading'
  | 'error'
  | 'projects'
  | 'isLoggedIn'
  | 'worldsWalletStats'
  | 'worldsPermissions'
  | 'isConnected'
  | 'isWorldContributorEnabled'
  | 'ensTotal'
>
export type MapDispatchProps = Pick<
  Props,
  | 'onOpenYourStorageModal'
  | 'onOpenPermissionsModal'
  | 'onOpenWorldsForENSOwnersAnnouncementModal'
  | 'onUnpublishWorld'
  | 'onFetchContributableNames'
  | 'onFetchENSList'
>
export type MapDispatch = Dispatch
