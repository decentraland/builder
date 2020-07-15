import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getData as getProfiles } from 'modules/profile/selectors'
import { OwnProps, MapStateProps, MapDispatch, MapDispatchProps } from './Profile.types'
import { loadProfileRequest } from 'modules/profile/actions'
import Profile from './Profile'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const profile = getProfiles(state)[ownProps.address]
  return {
    avatar: profile ? profile.avatars[0] : null
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onLoadProfile: address => dispatch(loadProfileRequest(address))
})

export default connect(mapState, mapDispatch)(Profile)
