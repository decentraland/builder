import ItemDropdown from './ItemDropdown'
import { RootState } from 'modules/common/types'
import { getAuthorizedItems } from 'modules/item/selectors'
import { MapStateProps } from './ItemDropdown.types'
import { connect } from 'react-redux'

const mapState = (state: RootState): MapStateProps => ({
  items: getAuthorizedItems(state)
})

export default connect(mapState)(ItemDropdown)
