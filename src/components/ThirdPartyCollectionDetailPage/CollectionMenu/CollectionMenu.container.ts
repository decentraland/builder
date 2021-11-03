import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet, getChainId } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { deleteCollectionRequest } from 'modules/collection/actions'
import { getName } from 'modules/profile/selectors'
import { openModal } from 'modules/modal/actions'
import { createCollectionForumPostRequest, CREATE_COLLECTION_FORUM_POST_REQUEST } from 'modules/forum/actions'
import { getLoading } from 'modules/collection/selectors'
import { getCollectionItems } from 'modules/item/selectors'
import { MapDispatchProps, MapDispatch, MapStateProps, OwnProps } from './CollectionMenu.types'
import CollectionMenu from './CollectionMenu'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  wallet: getWallet(state)!,
  items: getCollectionItems(state, ownProps.collection.id),
  name: getName(state) || '',
  chainId: getChainId(state),
  isForumPostLoading: isLoadingType(getLoading(state), CREATE_COLLECTION_FORUM_POST_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onPostToForum: (collection, forumPost) => dispatch(createCollectionForumPostRequest(collection, forumPost)),
  onDelete: collection => dispatch(deleteCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(CollectionMenu)
