import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getCollectionItemCount } from 'modules/collection/selectors'
import { setCollection } from 'modules/item/actions'
import { deleteCollectionRequest } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionCard.types'
import CollectionCard from './CollectionCard'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  itemCount: getCollectionItemCount(state, ownProps.collection.id)
})

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => ({
  onSetCollection: (item, collectionId) => dispatch(setCollection(item, collectionId)),
  onDeleteCollection: () => dispatch(deleteCollectionRequest(ownProps.collection))
})

export default connect(mapState, mapDispatch)(CollectionCard)
