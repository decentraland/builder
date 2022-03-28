import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getCollectionItems } from 'modules/item/selectors'
import { fetchCollectionItemsRequest } from 'modules/item/actions'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './CollectionRow.types'
import CollectionRow from './CollectionRow'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  items: getCollectionItems(state, ownProps.collection.id)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchCollectionItems: collectionId => dispatch(fetchCollectionItemsRequest(collectionId)),
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(CollectionRow)
