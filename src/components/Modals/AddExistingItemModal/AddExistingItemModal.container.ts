import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { fetchItemsRequest, SAVE_ITEM_REQUEST, setCollection } from 'modules/item/actions'
import { getLoading } from 'modules/item/selectors'
import { Item } from 'modules/item/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './AddExistingItemModal.types'
import AddExistingItemModal from './AddExistingItemModal'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  isLoading: isLoadingType(getLoading(state), SAVE_ITEM_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: (item: Item, collectionId: string | null) => dispatch(setCollection(item, collectionId)),
  onFetchItems: (address: string) => dispatch(fetchItemsRequest(address))
})

export default connect(mapState, mapDispatch)(AddExistingItemModal)
