import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getCollection } from 'modules/collection/selectors'
import { setCollectionMintersRequest } from 'modules/collection/actions'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './SellCollectionModal.types'
import SellCollectionModal from './SellCollectionModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collectionId } = ownProps.metadata

  return {
    collection: getCollection(state, collectionId)!
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetMinters: (collection, minters) => dispatch(setCollectionMintersRequest(collection, minters))
})

export default connect(mapState, mapDispatch)(SellCollectionModal)
