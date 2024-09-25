import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getItemCurations, getLoading as getLoadingItemCurations } from 'modules/curations/itemCuration/selectors'
import { FETCH_ITEM_CURATIONS_REQUEST } from 'modules/curations/itemCuration/actions'
import CollectionPublishButton from './CollectionPublishButton'
import { getIsLinkedWearablesPaymentsEnabled } from 'modules/features/selectors'
import { Item } from 'modules/item/types'
import { getStatusForItemIds } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps, PublishButtonAction } from './CollectionPublishButton.types'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collection, items } = ownProps
  return {
    itemCurations: getItemCurations(state, collection.id),
    isLoadingItemCurations: isLoadingType(getLoadingItemCurations(state), FETCH_ITEM_CURATIONS_REQUEST),
    isLinkedWearablesPaymentsEnabled: getIsLinkedWearablesPaymentsEnabled(state),
    itemsStatus: getStatusForItemIds(
      state,
      items.map(i => i.id)
    )
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNewClick: (collectionId: string, itemsWithChanges: Item[], itemsToPublish: Item[]) =>
    dispatch(openModal('PublishWizardCollectionModal', { collectionId, itemsWithChanges, itemsToPublish })),
  onClick: (collectionId: string, itemIds: string[], action: PublishButtonAction) =>
    dispatch(openModal('PublishThirdPartyCollectionModal', { collectionId, itemIds, action }))
})

export default connect(mapState, mapDispatch)(CollectionPublishButton)
