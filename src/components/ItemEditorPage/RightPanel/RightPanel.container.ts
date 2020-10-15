import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getItems } from 'modules/item/selectors'
import { deleteItemRequest, saveItemRequest } from 'modules/item/actions'
import { openModal } from 'modules/modal/actions'
import { getSelectedItemId } from 'modules/location/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './RightPanel.types'
import RightPanel from './RightPanel'

const mapState = (state: RootState): MapStateProps => ({
  items: getItems(state),
  selectedItemId: getSelectedItemId(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSaveItem: item => dispatch(saveItemRequest(item, {})),
  onDeleteItem: item => dispatch(deleteItemRequest(item)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(RightPanel)
