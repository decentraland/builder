import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getCollection } from 'modules/collection/selectors'
import { Collection } from 'modules/collection/types'
import { getIsLinkedWearablesV2Enabled } from 'modules/features/selectors'
import { saveItemRequest, SAVE_ITEM_REQUEST } from 'modules/item/actions'
import { getLoading, getError, getStatusByItemId } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CreateSingleItemModal.types'
import CreateSingleItemModal from './CreateSingleItemModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const collectionId: string | undefined = ownProps.metadata.collectionId || ownProps.metadata.item?.collectionId
  const collection: Collection | null = collectionId ? getCollection(state, collectionId) : null
  const statusByItemId = getStatusByItemId(state)
  const itemStatus = ownProps.metadata.item ? statusByItemId[ownProps.metadata.item.id] : null

  return {
    collection,
    address: getAddress(state),
    error: getError(state),
    isThirdPartyV2Enabled: getIsLinkedWearablesV2Enabled(state),
    itemStatus,
    isLoading: isLoadingType(getLoading(state), SAVE_ITEM_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSave: (item, contents) => dispatch(saveItemRequest(item, contents))
})

export default connect(mapState, mapDispatch)(CreateSingleItemModal)
