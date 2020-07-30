import { Avatar } from 'decentraland-ui'
import { loadProfileRequest, LoadProfileRequestAction } from 'modules/profile/actions'
import { Dispatch } from 'redux'

export type Props = {
  address: string
  avatar: Avatar | null
  onLoadProfile: typeof loadProfileRequest
  textOnly?: boolean
  imageOnly?: boolean
  size?: 'normal' | 'large' | 'huge'
}

export type MapStateProps = Pick<Props, 'avatar'>
export type MapDispatchProps = Pick<Props, 'onLoadProfile'>
export type MapDispatch = Dispatch<LoadProfileRequestAction>
export type OwnProps = Pick<Props, 'address' | 'textOnly' | 'size'>
