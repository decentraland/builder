import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionCard.types'
import CollectionCard from './CollectionCard'
import { setCollection } from 'modules/item/actions'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetCollection: (item, collectionId) => dispatch(setCollection(item, collectionId))
})

export default connect(mapState, mapDispatch)(CollectionCard)
