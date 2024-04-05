import { ButtonProps } from 'decentraland-ui/dist/components/Button/Button'
import { WorldPermissionNames, WorldPermissionType } from 'lib/api/worlds'

export type WorldPermissionsEssentials = { name: string; permissionName: WorldPermissionNames; permissionType: WorldPermissionType }

export type RightsModalProps = {
  show: boolean
  worldPermissionsEssentials?: WorldPermissionsEssentials
  addresses: string[]
  onSave: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    worldPermissionsEssentials: WorldPermissionsEssentials,
    newAddress: string
  ) => void
  onClear: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => void
  onCancel: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => void
  loading?: boolean
}
