import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { deleteItemRequest } from 'modules/item/actions'
import { setItems } from 'modules/editor/actions'
import { MapStateProps, MapDispatch, MapDispatchProps } from './CollectionItem.types'
import CollectionItem from './CollectionItem'

const mapState = (state: RootState): MapStateProps => ({
  ethAddress: getAddress(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onDeleteItem: item => dispatch(deleteItemRequest(item)),
  onSetItems: items => dispatch(setItems(items))
})

export default connect(mapState, mapDispatch)(CollectionItem)
