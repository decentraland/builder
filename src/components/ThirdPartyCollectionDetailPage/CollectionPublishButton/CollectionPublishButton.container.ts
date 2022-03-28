import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getItemCurations, getLoading as getLoadingItemCurations } from 'modules/curations/itemCuration/selectors'
import { FETCH_ITEM_CURATIONS_REQUEST } from 'modules/curations/itemCuration/actions'
import { getStatusForItemIds } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps, PublishButtonAction } from './CollectionPublishButton.types'
import CollectionPublishButton from './CollectionPublishButton'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collection, items } = ownProps
  return {
    itemCurations: getItemCurations(state, collection.id),
    isLoadingItemCurations: isLoadingType(getLoadingItemCurations(state), FETCH_ITEM_CURATIONS_REQUEST),
    itemsStatus: getStatusForItemIds(
      state,
      items.map(i => i.id)
    )
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClick: (collectionId: string, itemIds: string[], action: PublishButtonAction) =>
    dispatch(openModal('PublishThirdPartyCollectionModal', { collectionId, itemIds, action }))
})

export default connect(mapState, mapDispatch)(CollectionPublishButton)
