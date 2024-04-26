import { WorldPermissionNames } from 'lib/api/worlds'

export type Props = {
  loading?: boolean
  walletAddress?: string
  onUserPermissionListChange: (
    _event: React.MouseEvent,
    data: {
      worldPermissionName: WorldPermissionNames
      walletAddress: string
    }
  ) => void
}
