import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { Item } from 'modules/item/types'
import { mintCollectionItemsRequest, MINT_COLLECTION_ITEMS_REQUEST } from 'modules/collection/actions'
import { getCollection, getCollectionItems } from 'modules/collection/selectors'
import { Collection } from 'modules/collection/types'
import { canMintItem } from 'modules/item/utils'
import { getAuthorizedItems, getLoading } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './MintItemsModal.types'
import MintItemsModal from './MintItemsModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  let { collectionId, itemIds } = ownProps.metadata

  if (!collectionId && (!itemIds || itemIds.length === 0)) {
    throw new Error('Invalid collection id or items id to mint')
  }

  const ethAddress = getAddress(state)
  let collection: Collection
  let items: Item[]
  let totalCollectionItems: number

  if (collectionId) {
    items = getCollectionItems(state, collectionId)
    totalCollectionItems = items.length
  } else {
    const allItems = getAuthorizedItems(state)
    items = allItems.filter(item => itemIds.includes(item.id))
    collectionId = items[0].collectionId
    totalCollectionItems = allItems.filter(item => item.collectionId === collectionId).length
  }

  collection = getCollection(state, collectionId)!

  return {
    items: items.filter(item => canMintItem(collection, item, ethAddress)),
    isLoading: isLoadingType(getLoading(state), MINT_COLLECTION_ITEMS_REQUEST),
    ethAddress,
    collection,
    totalCollectionItems
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onMint: (collection, items) => dispatch(mintCollectionItemsRequest(collection, items))
})

export default connect(mapState, mapDispatch)(MintItemsModal)
