import { connect } from 'react-redux'
import { getProfileOfAddress, isLoadingProfile } from 'decentraland-dapps/dist/modules/profile/selectors'
import { RootState } from 'modules/common/types'
import { MapStateProps, OwnProps } from './WorldPermissionsAvatarWithInfo.types'
import { WorldPermissionsAvatarWithInfo } from './WorldPermissionsAvatarWithInfo'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  profileAvatar: getProfileOfAddress(state, ownProps.walletAddress)?.avatars[0],
  isLoading: isLoadingProfile(state, ownProps.walletAddress) || ownProps.isLoading
})

export default connect(mapState)(WorldPermissionsAvatarWithInfo)
