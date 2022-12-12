import { connect } from 'react-redux'
import { getSearch, replace } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { MapDispatch, MapDispatchProps, MapStateProps } from './ItemAddedToast.types'
import TableRow from './ItemAddedToast'
import { getNewItemName } from 'modules/item/selectors'

const mapState = (state: RootState): MapStateProps => ({
  itemName: getNewItemName(state),
  search: getSearch(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onReplace: (location: Parameters<typeof replace>[0]) => dispatch(replace(location))
})

export default connect(mapState, mapDispatch)(TableRow)
