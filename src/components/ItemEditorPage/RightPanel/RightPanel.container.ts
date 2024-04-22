import { connect } from 'react-redux'
import { getAddress, isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getItem, getError as getItemError, getStatusByItemId, isDownloading } from 'modules/item/selectors'
import { deleteItemRequest, downloadItemRequest, saveItemRequest, setCollection } from 'modules/item/actions'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { isOwner } from 'modules/item/utils'
import { getSelectedItemId } from 'modules/location/selectors'
import { getCollection, hasViewAndEditRights } from 'modules/collection/selectors'
import { isWalletCommitteeMember } from 'modules/committee/selectors'
import { getIsCampaignEnabled, getIsVrmOptOutEnabled } from 'modules/features/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './RightPanel.types'
import RightPanel from './RightPanel'

const mapState = (state: RootState): MapStateProps => {
  const selectedItemId = getSelectedItemId(state) || ''
  const selectedItem = getItem(state, selectedItemId)
  const address = getAddress(state) || ''
  const collection = selectedItemId && selectedItem && selectedItem.collectionId ? getCollection(state, selectedItem.collectionId) : null
  const statusByItemId = getStatusByItemId(state)
  const itemStatus = selectedItemId ? statusByItemId[selectedItemId] : null
  return {
    address,
    collection,
    selectedItem,
    selectedItemId,
    canEditSelectedItem: selectedItem
      ? collection
        ? hasViewAndEditRights(state, address, collection)
        : isOwner(selectedItem, address)
      : false,
    itemStatus,
    error: getItemError(state),
    isConnected: isConnected(state),
    isDownloading: isDownloading(state),
    isCommitteeMember: isWalletCommitteeMember(state),
    isCampaignEnabled: getIsCampaignEnabled(state),
    isVrmOptOutEnabled: getIsVrmOptOutEnabled(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSaveItem: (item, contents) => dispatch(saveItemRequest(item, contents)),
  onDeleteItem: item => dispatch(deleteItemRequest(item)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onSetCollection: (item, collectionId) => dispatch(setCollection(item, collectionId)),
  onDownload: itemId => dispatch(downloadItemRequest(itemId))
})

export default connect(mapState, mapDispatch)(RightPanel)
