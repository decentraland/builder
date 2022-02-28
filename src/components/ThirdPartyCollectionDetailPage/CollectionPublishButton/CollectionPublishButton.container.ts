import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { getStatusForItemIds } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps, PublishButtonAction } from './CollectionPublishButton.types'
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
  onClick: (collectionId: string, itemIds: string[], action: PublishButtonAction) =>
    dispatch(openModal('PublishThirdPartyCollectionModal', { collectionId, itemIds, action }))
})

export default connect(mapState, mapDispatch)(CollectionPublishButton)
