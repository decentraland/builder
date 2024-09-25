import { connect } from 'react-redux'
import { openModal } from 'decentraland-dapps/dist/modules/modal'
import { MapDispatchProps, MapDispatch, OwnProps } from './CreateCollectionSelectorModal.types'
import { CreateCollectionSelectorModal } from './CreateCollectionSelectorModal'

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

export default connect(undefined, mapDispatch)(CreateCollectionSelectorModal)
