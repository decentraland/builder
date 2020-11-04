import ItemDropdown from './ItemDropdown'
import { RootState } from 'modules/common/types'
import { getWalletItems } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ItemDropdown.types'
import { connect } from 'react-redux'

const mapState = (state: RootState): MapStateProps => ({
  items: getWalletItems(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(ItemDropdown)
