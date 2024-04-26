import { CheckboxProps, ButtonProps, InputOnChangeData } from 'decentraland-ui'
import { AllowListPermissionSetting, UnrestrictedPermissionSetting, WorldPermissionNames } from 'lib/api/worlds'

export type WorldPermissionsAccessProps = {
  loading: boolean
  isLoadingNewUser: boolean
  worldAccessPermissions?: AllowListPermissionSetting | UnrestrictedPermissionSetting
  isAccessUnrestricted: boolean
  showAddUserForm: boolean
  newAddress: string
  error: boolean
  onChangeAccessPermission: (_event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => void
  onShowAddUserForm: (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, _data: ButtonProps) => void
  onNewAddressChange: (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => void
  onUserPermissionListChange: (
    _event: React.MouseEvent,
    data: {
      worldPermissionName: WorldPermissionNames
      walletAddress: string
    }
  ) => void
}
