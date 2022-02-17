import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionThirdParty } from 'modules/thirdParty/selectors'
import { publishThirdPartyItemsRequest, PUBLISH_THIRD_PARTY_ITEMS_REQUEST } from 'modules/item/actions'
import { getCollection } from 'modules/collection/selectors'
import { getLoading, getCollectionItems } from 'modules/item/selectors'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './PublishThirdPartyCollectionModal.types'
import PublishCollectionModal from './PublishThirdPartyCollectionModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collectionId, itemIds } = ownProps.metadata

  const collection = getCollection(state, collectionId)
  const items = getCollectionItems(state, collectionId).filter(item => itemIds.includes(item.id))

  return {
    collection,
    items,
    thirdParty: collection ? getCollectionThirdParty(state, collection) : null,
    isPublishLoading: isLoadingType(getLoading(state), PUBLISH_THIRD_PARTY_ITEMS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (thirdParty, items, willPushChanges) => dispatch(publishThirdPartyItemsRequest(thirdParty, items, willPushChanges)) // TODO: @TP Should call the pushChanges action
})

export default connect(mapState, mapDispatch)(PublishCollectionModal)
