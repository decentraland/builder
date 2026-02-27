import { ButtonProps } from 'decentraland-ui'
import { AddressWorldPermission, WorldPermissionNames } from 'lib/api/worlds'

export type Props = {
  walletAddress?: string
  hasWorldDeploymentPermission?: boolean
  hasWorldStreamingPermission?: boolean
  permissionsSummary?: AddressWorldPermission[]
  loading?: boolean
  onRemoveCollaborator?: (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps & { walletAddress: string }) => void
  onUserPermissionListChange?: (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>,
    data: { worldPermissionName: WorldPermissionNames; walletAddress: string }
  ) => void
}
