import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { MapStateProps } from './Profile.types'
import Profile from './Profile'

const mapState = (state: RootState): MapStateProps => ({
  currentAddress: getAddress(state)
})

export default connect(mapState, null)(Profile)
