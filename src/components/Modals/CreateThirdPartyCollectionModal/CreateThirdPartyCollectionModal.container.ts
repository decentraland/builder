import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getLoading, getError as getCollectionError } from 'modules/collection/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal'
import { SAVE_COLLECTION_REQUEST, saveCollectionRequest } from 'modules/collection/actions'
import { getWalletThirdParties, getError } from 'modules/thirdParty/selectors'
import { getIsLinkedWearablesV2Enabled, getIsLinkedWearablesPaymentsEnabled } from 'modules/features/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CreateThirdPartyCollectionModal.types'
import { CreateThirdPartyCollectionModal } from './CreateThirdPartyCollectionModal'

const mapState = (state: RootState): MapStateProps => ({
  ownerAddress: getAddress(state),
  thirdParties: getWalletThirdParties(state),
  error: getCollectionError(state) || getError(state),
  isLinkedWearablesV2Enabled: getIsLinkedWearablesV2Enabled(state),
  isLinkedWearablesPaymentsEnabled: getIsLinkedWearablesPaymentsEnabled(state),
  isCreatingCollection: isLoadingType(getLoading(state), SAVE_COLLECTION_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => ({
  onBack: () => {
    ownProps.onClose()
    dispatch(openModal('CreateCollectionSelectorModal'))
  },
  onSubmit: collection => dispatch(saveCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(CreateThirdPartyCollectionModal)
