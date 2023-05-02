import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { MapStateProps, OwnProps } from './Profile.types'
import Profile from './Profile'

const mapState = (state: RootState): MapStateProps => ({
  currentAddress: getAddress(state)
})

const mergeProps = (mapStateProps: MapStateProps, _mapDispatchProps: null, ownProps: OwnProps) => ({
  ...mapStateProps,
  ...ownProps
})

export default connect(mapState, null, mergeProps)(Profile)
