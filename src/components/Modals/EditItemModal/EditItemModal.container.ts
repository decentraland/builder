import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/common/types'
import { getItems, getLoading } from 'modules/item/selectors'
import { saveItemRequest, FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './EditItemModal.types'
import EditItemModal from './EditItemModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { itemId } = ownProps.metadata
  const items = getItems(state)
  const item = items.find(item => item.id === itemId) || null

  return {
    item,
    isLoading: isLoadingType(getLoading(state), FETCH_ITEMS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSave: item => dispatch(saveItemRequest(item, {}))
})

export default connect(mapState, mapDispatch)(EditItemModal)
