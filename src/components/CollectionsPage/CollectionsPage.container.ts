import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { getWalletOrphanItems, getLoading as getLoadingItems } from 'modules/item/selectors'
import { getAuthorizedCollections, getLoading as getLoadingCollections } from 'modules/collection/selectors'
import { setCollectionPageView } from 'modules/ui/collection/actions'
import { getCollectionPageView } from 'modules/ui/collection/selectors'
import { isThirdPartyManager } from 'modules/thirdParty/selectors'
import { fetchItemsRequest, FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { FETCH_COLLECTIONS_REQUEST } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionsPage.types'
import CollectionsPage from './CollectionsPage'

const mapState = (state: RootState): MapStateProps => {
  const items = getWalletOrphanItems(state)

  return {
    items,
    address: getAddress(state),
    collections: getAuthorizedCollections(state),
    view: getCollectionPageView(state),
    isThirdPartyManager: isThirdPartyManager(state),
    isLoadingCollections: isLoadingType(getLoadingCollections(state), FETCH_COLLECTIONS_REQUEST),
    isLoadingItems: isLoadingType(getLoadingItems(state), FETCH_ITEMS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onSetView: view => dispatch(setCollectionPageView(view)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onFetchOrphanItems: address => dispatch(fetchItemsRequest(address))
})

export default connect(mapState, mapDispatch)(CollectionsPage)
