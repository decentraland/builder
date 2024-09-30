import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { deleteItemRequest } from 'modules/item/actions'
import { getStatusByItemId } from 'modules/item/selectors'
import { setItems } from 'modules/editor/actions'
import { MapStateProps, MapDispatch, MapDispatchProps, OwnProps } from './CollectionItem.types'
import CollectionItem from './CollectionItem'
import { getIsOffchainPublicItemOrdersEnabled } from 'modules/features/selectors'
import { getWallet } from 'modules/wallet/selectors'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const statusByItemId = getStatusByItemId(state)

  return {
    ethAddress: getAddress(state),
    status: statusByItemId[ownProps.item.id],
    wallet: getWallet(state),
    isOffchainPublicItemOrdersEnabled: getIsOffchainPublicItemOrdersEnabled(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onDeleteItem: item => dispatch(deleteItemRequest(item)),
  onSetItems: items => dispatch(setItems(items))
})

export default connect(mapState, mapDispatch)(CollectionItem)
