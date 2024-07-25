import { connect } from 'react-redux'
import { openModal } from 'decentraland-dapps/dist/modules/modal'
import { isLoadingThirdParties, isThirdPartyManager } from 'modules/thirdParty/selectors'
import { MapDispatchProps, MapDispatch, OwnProps, MapStateProps } from './CreateCollectionSelectorModal.types'
import { CreateCollectionSelectorModal } from './CreateCollectionSelectorModal'
import { RootState } from 'modules/common/types'

const mapState = (state: RootState): MapStateProps => ({
  isThirdPartyManager: isThirdPartyManager(state),
  isLoadingThirdParties: isLoadingThirdParties(state)
})

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => ({
  onCreateCollection: () => {
    ownProps.onClose()
    dispatch(openModal('CreateCollectionModal'))
  },
  onCreateThirdPartyCollection: () => {
    ownProps.onClose()
    dispatch(openModal('CreateThirdPartyCollectionModal'))
  }
})

export default connect(mapState, mapDispatch)(CreateCollectionSelectorModal)
