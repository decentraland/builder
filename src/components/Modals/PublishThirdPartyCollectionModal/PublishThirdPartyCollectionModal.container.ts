import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionThirdParty } from 'modules/thirdParty/selectors'
import {
  publishAndPushChangesThirdPartyItemsRequest,
  publishThirdPartyItemsRequest,
  PUBLISH_THIRD_PARTY_ITEMS_REQUEST,
  pushChangesThirdPartyItemsRequest,
  PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST
} from 'modules/thirdParty/actions'
import { getCollection } from 'modules/collection/selectors'
import { getLoading, getCollectionItems, getStatusForItemIds } from 'modules/item/selectors'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './PublishThirdPartyCollectionModal.types'
import PublishCollectionModal from './PublishThirdPartyCollectionModal'
import { getItemCurations } from 'modules/curations/itemCuration/selectors'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collectionId, itemIds } = ownProps.metadata

  const collection = getCollection(state, collectionId)
  const items = getCollectionItems(state, collectionId).filter(item => itemIds.includes(item.id))
  const itemCurations = getItemCurations(state, collectionId)

  return {
    collection,
    items,
    itemCurations,
    thirdParty: collection ? getCollectionThirdParty(state, collection) : null,
    isPublishLoading:
      isLoadingType(getLoading(state), PUBLISH_THIRD_PARTY_ITEMS_REQUEST) ||
      isLoadingType(getLoading(state), PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST),
    itemsStatus: getStatusForItemIds(
      state,
      items.map(i => i.id)
    )
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (thirdParty, items) => dispatch(publishThirdPartyItemsRequest(thirdParty, items)),
  onPushChanges: items => dispatch(pushChangesThirdPartyItemsRequest(items)),
  onPublishAndPushChanges: (thirdParty, itemsToPublish, itemsWithChanges) =>
    dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, itemsToPublish, itemsWithChanges))
})

export default connect(mapState, mapDispatch)(PublishCollectionModal)
