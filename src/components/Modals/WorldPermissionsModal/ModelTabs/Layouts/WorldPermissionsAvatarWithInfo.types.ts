import { Avatar } from '@dcl/schemas'

export type WorldPermissionsAvatarWithInfoProps = {
  loading?: boolean
  wallet?: string
  profiles?: Record<string, Avatar>
}
