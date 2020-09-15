import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { mintItemsRequest, MINT_ITEMS_REQUEST } from 'modules/item/actions'
import { getCollectionItems } from 'modules/collection/selectors'
import { getLoading } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './MintItemsModal.types'
import MintItemsModal from './MintItemsModal'

const mapState = (state: RootState): MapStateProps => ({
  items: getCollectionItems(state, 'dummy-collection2'),
  isLoading: isLoadingType(getLoading(state), MINT_ITEMS_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: items => dispatch(mintItemsRequest(items))
})

export default connect(mapState, mapDispatch)(MintItemsModal)
