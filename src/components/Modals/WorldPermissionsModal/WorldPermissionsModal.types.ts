import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Avatar } from '@dcl/schemas/dist/platform/profile/avatar'

import { WorldPermissionNames, WorldPermissionType, WorldPermissions } from 'lib/api/worlds'
import { deleteWorldPermissionsRequest, postWorldPermissionsRequest, putWorldPermissionsRequest } from 'modules/worlds/actions'

export type WorldPermissionsEssentials = { name: string; permissionName?: WorldPermissionNames; permissionType?: WorldPermissionType }

export type WorldPermissionsModalProps = {
  name: string
  error: string | null
  metadata: {
    worldName: string
  }
  worldPermissions?: WorldPermissions
  profiles: Record<string, Avatar>
  onPutWorldPermissionsRequest: typeof putWorldPermissionsRequest
  onPostWorldPermissionsRequest: typeof postWorldPermissionsRequest
  onDeleteWorldPermissionsRequest: typeof deleteWorldPermissionsRequest
  isLoading?: boolean
  isLoadingNewUser?: boolean
}

export type Props = Omit<ModalProps, 'metadata'> & WorldPermissionsModalProps

export type OwnProps = Pick<WorldPermissionsModalProps, 'metadata'>

export type MapStateProps = Pick<Props, 'isLoading' | 'isLoadingNewUser' | 'worldPermissions' | 'profiles' | 'error'>
export type MapDispatchProps = Pick<
  Props,
  'onPutWorldPermissionsRequest' | 'onPostWorldPermissionsRequest' | 'onDeleteWorldPermissionsRequest'
>
export type MapDispatch = Dispatch
