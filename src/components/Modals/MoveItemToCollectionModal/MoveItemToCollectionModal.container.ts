import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { SAVE_ITEM_REQUEST, setCollection } from 'modules/item/actions'
import { getLoading } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './MoveItemToCollectionModal.types'
import MoveItemToCollectionModal from './MoveItemToCollectionModal'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

const mapState = (state: RootState): MapStateProps => ({
  isLoading: isLoadingType(getLoading(state), SAVE_ITEM_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: (item, collectionId) => dispatch(setCollection(item, collectionId))
})

export default connect(mapState, mapDispatch)(MoveItemToCollectionModal)
