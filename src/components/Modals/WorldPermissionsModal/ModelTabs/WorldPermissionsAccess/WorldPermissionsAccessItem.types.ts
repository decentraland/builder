import { WorldPermissionNames } from 'lib/api/worlds'

export type WorldPermissionsAccessItemProps = {
  address?: string
  onUserPermissionListChange?: (
    _event: React.MouseEvent,
    data: {
      worldPermissionName: WorldPermissionNames
      walletAddress: string
    }
  ) => void
  loading?: boolean
}
