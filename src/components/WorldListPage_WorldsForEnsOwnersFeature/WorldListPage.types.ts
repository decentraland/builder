import { Dispatch } from 'redux'
import { Deployment } from 'modules/deployment/types'
import { ENS } from 'modules/ens/types'
import { Project } from 'modules/project/types'
import { WorldsWalletStats } from 'lib/api/worlds'
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
  isLoading: boolean
  worldsWalletStats?: WorldsWalletStats
  onNavigate: (path: string) => void
  onOpenYourStorageModal: (metadata: WorldsYourStorageModalMetadata) => void
  onOpenWorldsForENSOwnersAnnouncementModal: () => void
}

export type State = {
  page: number
  sortBy: SortBy
}

export type MapStateProps = Pick<
  Props,
  'ensList' | 'externalNames' | 'deploymentsByWorlds' | 'isLoading' | 'error' | 'projects' | 'isLoggedIn' | 'worldsWalletStats'
>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenYourStorageModal' | 'onOpenWorldsForENSOwnersAnnouncementModal'>
export type MapDispatch = Dispatch
