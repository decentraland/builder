import { Avatar } from '@dcl/schemas'

export type Props = {
  walletAddress: string
  isLoading?: boolean
  profileAvatar?: Avatar
}

export type OwnProps = Pick<Props, 'walletAddress' | 'isLoading'>
export type MapStateProps = Pick<Props, 'profileAvatar' | 'isLoading'>
