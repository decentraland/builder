import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { deleteCollectionRequest } from 'modules/collection/actions'
import { getName } from 'modules/profile/selectors'
import { openModal } from 'modules/modal/actions'
import { createCollectionForumPostRequest, CREATE_COLLECTION_FORUM_POST_REQUEST } from 'modules/forum/actions'
import { getCollectionItems, getLoading } from 'modules/collection/selectors'
import { MapDispatchProps, MapDispatch, MapStateProps, OwnProps } from './CollectionMenu.types'
import CollectionMenu from './CollectionMenu'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  items: getCollectionItems(state, ownProps.collection.id),
  isForumPostLoading: isLoadingType(getLoading(state), CREATE_COLLECTION_FORUM_POST_REQUEST),
  name: getName(state) || ''
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onPostToForum: (collection, forumPost) => dispatch(createCollectionForumPostRequest(collection, forumPost)),
  onDelete: collection => dispatch(deleteCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(CollectionMenu)
