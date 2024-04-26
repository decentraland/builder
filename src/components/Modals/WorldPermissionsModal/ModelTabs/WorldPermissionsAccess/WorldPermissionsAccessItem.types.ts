import { WorldPermissionNames } from 'lib/api/worlds'

export type WorldPermissionsAccessItemProps = {
  address?: string
  onUserPermissionListChange?: (
    _event: React.MouseEvent,
    data: {
      worldPermissionName: WorldPermissionNames
      wallet: string
    }
  ) => void
  loading?: boolean
}
