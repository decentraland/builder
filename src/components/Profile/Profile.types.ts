import { Avatar } from 'decentraland-ui'
import { loadProfileRequest, LoadProfileRequestAction } from 'modules/profile/actions'
import { Dispatch } from 'redux'

export type Props = {
  address: string
  avatar: Avatar | null
  textOnly?: boolean
  imageOnly?: boolean
  avatarOnly?: boolean
  blockieOnly?: boolean
  size?: 'normal' | 'large' | 'huge'
  onLoadProfile: typeof loadProfileRequest
}

export type MapStateProps = Pick<Props, 'avatar'>
export type MapDispatchProps = Pick<Props, 'onLoadProfile'>
export type MapDispatch = Dispatch<LoadProfileRequestAction>
export type OwnProps = Pick<Props, 'address' | 'textOnly' | 'size'>
