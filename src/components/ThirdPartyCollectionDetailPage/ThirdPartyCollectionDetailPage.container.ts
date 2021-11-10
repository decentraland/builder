import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getThirdPartyCollectionId } from 'modules/location/selectors'
import { getCollection, getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { getCollectionItems, getLoading as getLoadingItem } from 'modules/item/selectors'
import { FETCH_COLLECTIONS_REQUEST, DELETE_COLLECTION_REQUEST } from 'modules/collection/actions'
import { openModal } from 'modules/modal/actions'
import { FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { getThirdParty } from 'modules/thirdParty/selectors'
import { decodeURN } from 'lib/urn'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ThirdPartyCollectionDetailPage.types'
import CollectionDetailPage from './ThirdPartyCollectionDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const collectionId = getThirdPartyCollectionId(state) || ''
  const collection = getCollection(state, collectionId)

  return {
    wallet: getWallet(state)!,
    collection,
    items: getCollectionItems(state, collectionId),
    isLoading:
      isLoadingType(getLoadingCollection(state), FETCH_COLLECTIONS_REQUEST) ||
      isLoadingType(getLoadingCollection(state), DELETE_COLLECTION_REQUEST) ||
      isLoadingType(getLoadingItem(state), FETCH_ITEMS_REQUEST),
    // TODO, typing this?
    thirdParty: collection && collection.urn ? getThirdParty(state, (decodeURN(collection.urn) as any).thirdPartyName) : null
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(CollectionDetailPage)
