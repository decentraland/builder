import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionPublishButton.types'
import CollectionPublishButton from './CollectionPublishButton'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (collectionId: string, itemIds: string[]) => dispatch(openModal('PublishThirdPartyCollectionModal', { collectionId, itemIds }))
})

export default connect(mapState, mapDispatch)(CollectionPublishButton)
