import { ButtonProps, InputOnChangeData } from 'decentraland-ui'
import { AllowListPermissionSetting, WorldPermissionNames } from 'lib/api/worlds'

export type WorldPermissionsCollaboratorsProps = {
  loading: boolean
  worldDeploymentPermissions?: AllowListPermissionSetting
  worldStreamingPermissions?: AllowListPermissionSetting
  collaboratorUserList?: string[]
  showAddUserForm: boolean
  newAddress: string
  error: boolean
  onShowAddUserForm: (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, _data: ButtonProps) => void
  onNewAddressChange: (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => void
  onAddUserToCollaboratorsList: (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => void
  onRemoveCollaborator: (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps & { walletAddress: string }) => void
  onUserPermissionListChange: (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>,
    data: { worldPermissionName: WorldPermissionNames; walletAddress: string }
  ) => void
}
