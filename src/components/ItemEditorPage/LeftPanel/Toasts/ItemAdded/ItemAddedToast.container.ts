import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps } from './ItemAddedToast.types'
import TableRow from './ItemAddedToast'
import { getNewItemName } from 'modules/item/selectors'

const mapState = (state: RootState): MapStateProps => ({
  itemName: getNewItemName(state)
})

export default connect(mapState)(TableRow)
