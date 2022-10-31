import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import {
  getCollection,
  getLoading as getCollectionLoading,
  getUnsyncedCollectionError,
  getError as getCollectionError
} from 'modules/collection/selectors'
import { getLoading as getItemLoading, getCollectionItems, getError as getItemError } from 'modules/item/selectors'
import { publishCollectionRequest, PUBLISH_COLLECTION_REQUEST } from 'modules/collection/actions'
import { CREATE_COLLECTION_FORUM_POST_REQUEST } from 'modules/forum/actions'
import { fetchRaritiesRequest, FETCH_RARITIES_REQUEST, FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { getRarities } from 'modules/item/selectors'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './PublishWizardCollectionModal.types'
import PublishWizardCollectionModal from './PublishWizardCollectionModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collectionId } = ownProps.metadata
  const collection = getCollection(state, collectionId)!
  const isPublishLoading = isLoadingType(getCollectionLoading(state), PUBLISH_COLLECTION_REQUEST)
  const isFetchingItems = isLoadingType(getItemLoading(state), FETCH_ITEMS_REQUEST)
  const isFetchingRarities = isLoadingType(getItemLoading(state), FETCH_RARITIES_REQUEST)
  const isCreatingForumPost = isLoadingType(getCollectionLoading(state), CREATE_COLLECTION_FORUM_POST_REQUEST)

  return {
    wallet: getWallet(state)!,
    collection,
    items: getCollectionItems(state, collectionId),
    rarities: getRarities(state),
    unsyncedCollectionError: getUnsyncedCollectionError(state),
    itemError: getItemError(state),
    collectionError: getCollectionError(state),
    isLoading: isPublishLoading || isFetchingItems || isFetchingRarities || isCreatingForumPost || !!collection.lock
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (collection, items, email) => dispatch(publishCollectionRequest(collection, items, email)),
  onFetchRarities: () => dispatch(fetchRaritiesRequest())
})

export default connect(mapState, mapDispatch)(PublishWizardCollectionModal)
