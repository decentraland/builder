import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getCollectionThirdParty } from 'modules/thirdParty/selectors'
import {
  publishAndPushChangesThirdPartyItemsRequest,
  publishThirdPartyItemsRequest,
  pushChangesThirdPartyItemsRequest
} from 'modules/thirdParty/actions'
import { getCollection } from 'modules/collection/selectors'
import { getCollectionItems, getStatusForItemIds } from 'modules/item/selectors'
import { getItemCurations } from 'modules/curations/itemCuration/selectors'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './ReviewConditionsStep.types'
import { ReviewConditionsStep } from './ReviewConditionsStep'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collectionId, itemIds } = ownProps

  const collection = getCollection(state, collectionId)
  const items = getCollectionItems(state, collectionId).filter(item => itemIds.includes(item.id))
  const itemCurations = getItemCurations(state, collectionId)

  return {
    items,
    itemCurations,
    thirdParty: collection ? getCollectionThirdParty(state, collection) : null,
    itemsStatus: getStatusForItemIds(
      state,
      items.map(i => i.id)
    )
  }
}

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => ({
  onPublish: (thirdParty, items, email, subscribeToNewsletter) =>
    dispatch(publishThirdPartyItemsRequest(thirdParty, items, email, subscribeToNewsletter)),
  onPushChanges: items => {
    dispatch(pushChangesThirdPartyItemsRequest(items))
    ownProps.onGoToNextStep()
  },
  onPublishAndPushChanges: (thirdParty, itemsToPublish, itemsWithChanges) =>
    dispatch(publishAndPushChangesThirdPartyItemsRequest(thirdParty, itemsToPublish, itemsWithChanges))
})

export default connect(mapState, mapDispatch)(ReviewConditionsStep)
