import { Avatar } from '@dcl/schemas/dist/platform/profile/avatar'
import { WorldPermissionNames } from 'lib/api/worlds'

export type WorldPermissionsAccessItemProps = {
  address?: string
  profiles?: Record<string, Avatar>
  onUserPermissionListChange?: (
    _event: React.MouseEvent,
    data: {
      worldPermissionName: WorldPermissionNames
      wallet: string
    }
  ) => void
  loading?: boolean
}
