import ItemDropdown from './ItemDropdown'
import { RootState } from 'modules/common/types'
import { getAuthorizedItems } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ItemDropdown.types'
import { connect } from 'react-redux'

const mapState = (state: RootState): MapStateProps => ({
  items: getAuthorizedItems(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(ItemDropdown)
