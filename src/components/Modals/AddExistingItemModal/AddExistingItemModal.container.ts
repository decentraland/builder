import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { setCollection } from 'modules/item/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './AddExistingItemModal.types'
import AddExistingItemModal from './AddExistingItemModal'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: (item, collectionId) => dispatch(setCollection(item, collectionId))
})

export default connect(mapState, mapDispatch)(AddExistingItemModal)
