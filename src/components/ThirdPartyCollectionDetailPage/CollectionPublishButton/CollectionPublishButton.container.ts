import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { getStatusForItemIds } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionPublishButton.types'
import CollectionPublishButton from './CollectionPublishButton'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  return {
    itemsStatus: getStatusForItemIds(
      state,
      ownProps.items.map(i => i.id)
    )
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (collectionId: string, itemIds: string[], shouldPushChanges = false) =>
    dispatch(openModal('PublishThirdPartyCollectionModal', { collectionId, itemIds, shouldPushChanges })),
  onPushChanges: (collectionId: string, itemIds: string[]) =>
    dispatch(openModal('PublishThirdPartyCollectionModal', { collectionId, itemIds })) // TODO: Implement the push changes logic
})

export default connect(mapState, mapDispatch)(CollectionPublishButton)
