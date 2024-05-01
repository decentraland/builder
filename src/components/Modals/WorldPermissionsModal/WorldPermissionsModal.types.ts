import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { loadProfileRequest } from 'decentraland-dapps/dist/modules/profile'

import { WorldPermissionNames, WorldPermissionType, WorldPermissions } from 'lib/api/worlds'
import { deleteWorldPermissionsRequest, postWorldPermissionsRequest, putWorldPermissionsRequest } from 'modules/worlds/actions'

export type WorldPermissionsEssentials = { name: string; permissionName?: WorldPermissionNames; permissionType?: WorldPermissionType }

export type WorldPermissionsModalProps = {
  name: string
  error: string | null
  metadata: {
    worldName: string
    isCollaboratorsTabShown?: boolean
  }
  worldPermissions?: WorldPermissions
  onPutWorldPermissionsRequest: typeof putWorldPermissionsRequest
  onPostWorldPermissionsRequest: typeof postWorldPermissionsRequest
  onDeleteWorldPermissionsRequest: typeof deleteWorldPermissionsRequest
  onGetProfile: typeof loadProfileRequest
  onGetWorldPermissions: (worldName: string) => void
  isLoading?: boolean
  isLoadingNewUser?: boolean
}

export type Props = Omit<ModalProps, 'metadata'> & WorldPermissionsModalProps

export type OwnProps = Pick<WorldPermissionsModalProps, 'metadata'>

export type MapStateProps = Pick<Props, 'isLoading' | 'isLoadingNewUser' | 'worldPermissions' | 'error'>
export type MapDispatchProps = Pick<
  Props,
  | 'onPutWorldPermissionsRequest'
  | 'onPostWorldPermissionsRequest'
  | 'onDeleteWorldPermissionsRequest'
  | 'onGetProfile'
  | 'onGetWorldPermissions'
>
export type MapDispatch = Dispatch
