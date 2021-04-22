import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getItem } from 'modules/item/selectors'
import { deleteItemRequest, saveItemRequest, savePublishedItemRequest, setCollection } from 'modules/item/actions'
import { openModal } from 'modules/modal/actions'
import { getSelectedItemId } from 'modules/location/selectors'
import { getCollection } from 'modules/collection/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './RightPanel.types'
import RightPanel from './RightPanel'

const mapState = (state: RootState): MapStateProps => {
  const selectedItemId = getSelectedItemId(state) || ''
  const selectedItem = getItem(state, selectedItemId)

  return {
    address: getAddress(state),
    collection: selectedItemId && selectedItem && selectedItem.collectionId ? getCollection(state, selectedItem.collectionId) : null,
    selectedItem,
    selectedItemId
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
