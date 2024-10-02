import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getAuthorizedItems, getError, getLoading } from 'modules/item/selectors'
import { OwnProps, MapStateProps, MapDispatch, MapDispatchProps } from './PutForSaleOffchainModal.types'
import PutForSaleOffchainModal from './PutForSaleOffchainModal'
import { CREATE_ITEM_ORDER_TRADE_REQUEST, createItemOrderTradeRequest } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading'
import { getAuthorizedCollections } from 'modules/collection/selectors'
import { Collection } from 'modules/collection/types'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { itemId } = ownProps.metadata
  const items = getAuthorizedItems(state)
  const collections = getAuthorizedCollections(state)
  const item = ownProps.item ?? items.find(item => item.id === itemId)!
  const collection = collections.find(collection => collection.id === item.collectionId)

  return {
    item,
    collection,
    isLoading: isLoadingType(getLoading(state), CREATE_ITEM_ORDER_TRADE_REQUEST),
    error: getError(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onCreateItemOrder: (item: Item, priceInWei: string, beneficiary: string, collection: Collection, expiresAt: Date) =>
    dispatch(createItemOrderTradeRequest(item, priceInWei, beneficiary, collection, expiresAt))
})

export default connect(mapState, mapDispatch)(PutForSaleOffchainModal)
