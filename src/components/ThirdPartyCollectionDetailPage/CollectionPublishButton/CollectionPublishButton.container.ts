import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionPublishButton.types'
import CollectionPublishButton from './CollectionPublishButton'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => {
  const { collection, items } = ownProps
  const collectionId = collection.id
  const itemIds = items.map(item => item.id)
  return {
    onPublish: () => dispatch(openModal('PublishThirdPartyCollectionModal', { collectionId, itemIds }))
  }
}

export default connect(mapState, mapDispatch)(CollectionPublishButton)
