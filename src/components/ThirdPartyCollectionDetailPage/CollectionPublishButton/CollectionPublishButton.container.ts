import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { getStatusByItemId } from 'modules/item/selectors'
import { SyncStatus } from 'modules/item/types'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionPublishButton.types'
import CollectionPublishButton from './CollectionPublishButton'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const statusByItemId = getStatusByItemId(state)
  const itemsStatus = ownProps.items.reduce((acc, currItem) => {
    acc[currItem.id] = statusByItemId[currItem.id]
    return acc
  }, {} as Record<string, SyncStatus>)

  return {
    itemsStatus
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (collectionId: string, itemIds: string[], shouldPushChanges = false) =>
    dispatch(openModal('PublishThirdPartyCollectionModal', { collectionId, itemIds, shouldPushChanges })),
  onPushChanges: (collectionId: string, itemIds: string[]) =>
    dispatch(openModal('PublishThirdPartyCollectionModal', { collectionId, itemIds })) // TODO: Implement the push changes logic
})

export default connect(mapState, mapDispatch)(CollectionPublishButton)
