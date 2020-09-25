import { connect } from 'react-redux'
import { getSearch } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getItems } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './RightPanel.types'
import RightPanel from './RightPanel'
import { deleteItemRequest, saveItemRequest } from 'modules/item/actions'
import { openModal } from 'modules/modal/actions'

const mapState = (state: RootState): MapStateProps => ({
  items: getItems(state),
  selectedItemId: new URLSearchParams(getSearch(state)).get('item')
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSaveItem: item => dispatch(saveItemRequest(item, {})),
  onDeleteItem: item => dispatch(deleteItemRequest(item)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(RightPanel)
