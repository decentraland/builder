import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/common/types'
import { getAuthorizedItems, getLoading } from 'modules/item/selectors'
import {
  saveItemRequest,
  savePublishedItemRequest,
  FETCH_ITEMS_REQUEST,
  SAVE_ITEM_REQUEST,
  SAVE_PUBLISHED_ITEM_REQUEST
} from 'modules/item/actions'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './EditPriceAndBeneficiaryModal.types'
import EditPriceAndBeneficiaryModal from './EditPriceAndBeneficiaryModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { itemId } = ownProps.metadata
  const items = getAuthorizedItems(state)
  const item = items.find(item => item.id === itemId)!

  return {
    item,
    isLoading:
      isLoadingType(getLoading(state), FETCH_ITEMS_REQUEST) ||
      isLoadingType(getLoading(state), SAVE_ITEM_REQUEST) ||
      isLoadingType(getLoading(state), SAVE_PUBLISHED_ITEM_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSave: (item, contents) => dispatch(saveItemRequest(item, contents)),
  onSavePublished: (item, contents) => dispatch(savePublishedItemRequest(item, contents))
})

export default connect(mapState, mapDispatch)(EditPriceAndBeneficiaryModal)
