import { Dispatch } from 'redux'
import { Deployment } from 'modules/deployment/types'
import { ENS } from 'modules/ens/types'
import { Project } from 'modules/project/types'
import { WorldPermissionNames, WorldPermissionType, WorldPermissions, WorldsWalletStats } from 'lib/api/worlds'
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
  onNavigate: (path: string) => void
  onOpenYourStorageModal: (metadata: WorldsYourStorageModalMetadata) => void
  onOpenWorldsForENSOwnersAnnouncementModal: () => void
  getWorldPermissionsRequest: (worldName: string) => void
  postWorldPermissionsRequest: (worldName: string, permissionName: WorldPermissionNames, permissionType: WorldPermissionType) => void
  putWorldPermissionsRequest: (
    worldName: string,
    permissionName: WorldPermissionNames,
    permissionType: WorldPermissionType.AllowList | WorldPermissionType.NFTOwnership | WorldPermissionType.SharedSecret,
    newData: string
  ) => void
  deleteWorldPermissionsRequest: (
    worldName: string,
    permissionName: WorldPermissionNames,
    permissionType: WorldPermissionType.AllowList | WorldPermissionType.NFTOwnership | WorldPermissionType.SharedSecret,
    newData: string
  ) => void
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
>
export type MapDispatchProps = Pick<
  Props,
  | 'onNavigate'
  | 'onOpenYourStorageModal'
  | 'onOpenWorldsForENSOwnersAnnouncementModal'
  | 'getWorldPermissionsRequest'
  | 'postWorldPermissionsRequest'
  | 'putWorldPermissionsRequest'
  | 'deleteWorldPermissionsRequest'
>
export type MapDispatch = Dispatch
