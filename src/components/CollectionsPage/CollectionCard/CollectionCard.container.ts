import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getCollectionItemCount } from 'modules/collection/selectors'
import { deleteCollectionRequest } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionCard.types'
import CollectionCard from './CollectionCard'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  itemCount: getCollectionItemCount(state, ownProps.collection.id)
})

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => ({
  onDeleteCollection: () => dispatch(deleteCollectionRequest(ownProps.collection))
})

export default connect(mapState, mapDispatch)(CollectionCard)
