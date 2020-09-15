import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { mintItemsRequest, MINT_ITEMS_REQUEST } from 'modules/item/actions'
import { getItems, getLoading } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './MintItemsModal.types'
import MintItemsModal from './MintItemsModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { itemIds } = ownProps.metadata
  const allItems = getItems(state)
  const items = allItems.filter(item => itemIds.includes(item.id))
  return {
    items,
    isLoading: isLoadingType(getLoading(state), MINT_ITEMS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: items => dispatch(mintItemsRequest(items))
})

export default connect(mapState, mapDispatch)(MintItemsModal)
