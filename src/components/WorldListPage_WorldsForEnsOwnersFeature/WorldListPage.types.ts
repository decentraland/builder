import { Dispatch } from 'redux'
import { Deployment } from 'modules/deployment/types'
import { ENS } from 'modules/ens/types'
import { Project } from 'modules/project/types'
import { WorldsWalletStats } from 'lib/api/worlds'

export enum SortBy {
  DESC = 'DESC',
  ASC = 'ASC'
}

export type Props = {
  error?: string
  ensList: ENS[]
  deploymentsByWorlds: Record<string, Deployment>
  projects: Project[]
  isLoggedIn: boolean
  isLoading: boolean
  worldsWalletStats?: WorldsWalletStats
  onNavigate: (path: string) => void
  onFetchWorldsWalletStats: () => void
  onFetchExternalNames: () => void
}

export type State = {
  page: number
  sortBy: SortBy
}

export type MapStateProps = Pick<
  Props,
  'ensList' | 'deploymentsByWorlds' | 'isLoading' | 'error' | 'projects' | 'isLoggedIn' | 'worldsWalletStats'
>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onFetchWorldsWalletStats' | 'onFetchExternalNames'>
export type MapDispatch = Dispatch
