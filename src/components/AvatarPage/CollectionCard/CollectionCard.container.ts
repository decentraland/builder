import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { getCollectionItems } from 'modules/collection/selectors'
import { setCollection } from 'modules/item/actions'
import CollectionCard from './CollectionCard'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionCard.types'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  items: getCollectionItems(state, ownProps.collection.id)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetCollection: (item, collectionId) => dispatch(setCollection(item, collectionId))
})

export default connect(mapState, mapDispatch)(CollectionCard)
