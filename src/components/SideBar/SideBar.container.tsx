import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getCategories, isLoading } from 'modules/category/selectors'
import { MapStateProps } from './SideBar.types'
import SideBar from './SideBar'

const mapState = (state: RootState): MapStateProps => ({
  categories: getCategories(state),
  isLoading: isLoading(state)
})

const mapDispatch = () => ({})

export default connect(
  mapState,
  mapDispatch
)(SideBar)
