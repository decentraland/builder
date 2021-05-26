import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getItem, getLoading } from 'modules/item/selectors'
import {
  deleteItemRequest,
  DEPLOY_ITEM_CONTENTS_REQUEST,
  saveItemRequest,
  savePublishedItemRequest,
  SAVE_PUBLISHED_ITEM_SUCCESS,
  setCollection
} from 'modules/item/actions'
import { openModal } from 'modules/modal/actions'
import { getSelectedItemId } from 'modules/location/selectors'
import { getCollection } from 'modules/collection/selectors'
import { getPendingTransactions } from 'modules/transaction/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './RightPanel.types'
import RightPanel from './RightPanel'

const mapState = (state: RootState): MapStateProps => {
  const selectedItemId = getSelectedItemId(state) || ''
  const selectedItem = getItem(state, selectedItemId)
  const address = getAddress(state) || ''

  return {
    address,
    collection: selectedItemId && selectedItem && selectedItem.collectionId ? getCollection(state, selectedItem.collectionId) : null,
    selectedItem,
    selectedItemId,
    isLoading:
      isLoadingType(getLoading(state), DEPLOY_ITEM_CONTENTS_REQUEST) ||
      getPendingTransactions(state).some(tx => tx.actionType === SAVE_PUBLISHED_ITEM_SUCCESS)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSaveItem: (item, contents) => dispatch(saveItemRequest(item, contents)),
  onSavePublishedItem: (item, contents) => dispatch(savePublishedItemRequest(item, contents)),
  onDeleteItem: item => dispatch(deleteItemRequest(item)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onSetCollection: (item, collectionId) => dispatch(setCollection(item, collectionId))
})

export default connect(mapState, mapDispatch)(RightPanel)
