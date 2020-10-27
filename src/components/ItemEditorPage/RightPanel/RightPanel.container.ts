import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getItems } from 'modules/item/selectors'
import { deleteItemRequest, saveItemRequest, setCollection } from 'modules/item/actions'
import { openModal } from 'modules/modal/actions'
import { getSelectedItemId } from 'modules/location/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './RightPanel.types'
import RightPanel from './RightPanel'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  items: getItems(state),
  selectedItemId: getSelectedItemId(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSaveItem: item => dispatch(saveItemRequest(item, {})),
  onDeleteItem: item => dispatch(deleteItemRequest(item)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onSetCollection: (item, collectionId) => dispatch(setCollection(item, collectionId))
})

export default connect(mapState, mapDispatch)(RightPanel)
