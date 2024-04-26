import { ButtonProps } from 'decentraland-ui'
import { AllowListPermissionSetting, WorldPermissionNames } from 'lib/api/worlds'

export type WorldPermissionsCollaboratorsItemProps = {
  wallet?: string
  worldDeploymentPermissions?: AllowListPermissionSetting
  worldStreamingPermissions?: AllowListPermissionSetting
  loading?: boolean
  onRemoveCollaborator?: (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps & { wallet: string }) => void
  onUserPermissionListChange?: (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>,
    data: { worldPermissionName: WorldPermissionNames; wallet: string }
  ) => void
}
