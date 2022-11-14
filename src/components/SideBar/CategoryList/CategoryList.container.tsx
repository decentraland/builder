import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getSideBarCategories } from 'modules/ui/sidebar/selectors'
import { selectCategory } from 'modules/ui/sidebar/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CategoryList.types'
import CategoryList from './CategoryList'

const mapState = (state: RootState): MapStateProps => ({
  categories: getSideBarCategories(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSelectCategory: category => dispatch(selectCategory(category))
})

export default connect(mapState, mapDispatch)(CategoryList)
