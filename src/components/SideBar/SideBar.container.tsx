import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getData as getAssets } from 'modules/asset/selectors'
import { MapStateProps } from './SideBar.types'
import SideBar from './SideBar'

const mapState = (state: RootState): MapStateProps => ({
  assets: getAssets(state)
})

const mapDispatch = () => ({})

export default connect(
  mapState,
  mapDispatch
)(SideBar)
