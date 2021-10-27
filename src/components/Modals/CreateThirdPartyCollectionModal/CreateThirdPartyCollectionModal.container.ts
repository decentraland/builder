import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getLoading } from 'modules/collection/selectors'
import { SAVE_COLLECTION_REQUEST, saveCollectionRequest } from 'modules/collection/actions'
import { getWalletThirdParties, getError } from 'modules/thirdParty/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CreateThirdPartyCollectionModal.types'
import CreateThirdPartyCollectionModal from './CreateThirdPartyCollectionModal'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  thirdParties: getWalletThirdParties(state),
  error: getError(state),
  isLoading: isLoadingType(getLoading(state), SAVE_COLLECTION_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: collection => dispatch(saveCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(CreateThirdPartyCollectionModal)
