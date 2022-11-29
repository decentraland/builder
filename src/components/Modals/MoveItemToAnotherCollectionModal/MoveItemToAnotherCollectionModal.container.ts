import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { SAVE_ITEM_REQUEST, setItemCollection } from 'modules/item/actions'
import { getLoading } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './MoveItemToAnotherCollectionModal.types'
import MoveItemToAnotherCollectionModal from './MoveItemToAnotherCollectionModal'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

const mapState = (state: RootState): MapStateProps => ({
  isLoading: isLoadingType(getLoading(state), SAVE_ITEM_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: (item, collectionId) => dispatch(setItemCollection(item, collectionId))
})

export default connect(mapState, mapDispatch)(MoveItemToAnotherCollectionModal)
