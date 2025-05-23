import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/common/types'
import { getAuthorizedItems, getLoading, getError } from 'modules/item/selectors'
import {
  saveItemRequest,
  setPriceAndBeneficiaryRequest,
  FETCH_ITEMS_REQUEST,
  SAVE_ITEM_REQUEST,
  SET_PRICE_AND_BENEFICIARY_REQUEST
} from 'modules/item/actions'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './EditPriceAndBeneficiaryModal.types'
import EditPriceAndBeneficiaryModal from './EditPriceAndBeneficiaryModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { itemId } = ownProps.metadata
  const items = getAuthorizedItems(state)
  const item = ownProps.item ?? items.find(item => item.id === itemId)!

  return {
    item,
    error: getError(state),
    isLoading:
      isLoadingType(getLoading(state), FETCH_ITEMS_REQUEST) ||
      isLoadingType(getLoading(state), SAVE_ITEM_REQUEST) ||
      isLoadingType(getLoading(state), SET_PRICE_AND_BENEFICIARY_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSave: (item, contents) => dispatch(saveItemRequest(item, contents)),
  onSetPriceAndBeneficiary: (itemId: string, price: string, beneficiary: string) =>
    dispatch(setPriceAndBeneficiaryRequest(itemId, price, beneficiary))
})

export default connect(mapState, mapDispatch)(EditPriceAndBeneficiaryModal)
