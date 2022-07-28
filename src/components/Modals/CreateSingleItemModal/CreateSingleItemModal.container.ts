import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { saveItemRequest, SAVE_ITEM_REQUEST, setPriceAndBeneficiaryRequest } from 'modules/item/actions'
import { getLoading, getError } from 'modules/item/selectors'
import { getCollection } from 'modules/collection/selectors'
import { Collection } from 'modules/collection/types'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CreateSingleItemModal.types'
import CreateSingleItemModal from './CreateSingleItemModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const collection: Collection | null = ownProps.metadata.collectionId ? getCollection(state, ownProps.metadata.collectionId) : null

  return {
    collection,
    address: getAddress(state),
    error: getError(state),
    isLoading: isLoadingType(getLoading(state), SAVE_ITEM_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSave: (item, contents) => dispatch(saveItemRequest(item, contents)),
  onNavigate: path => dispatch(push(path)),
  onSetPriceAndBeneficiary: (itemId, price, beneficiary) => dispatch(setPriceAndBeneficiaryRequest(itemId, price, beneficiary))
})

export default connect(mapState, mapDispatch)(CreateSingleItemModal)
