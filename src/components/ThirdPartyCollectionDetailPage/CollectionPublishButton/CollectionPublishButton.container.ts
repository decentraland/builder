import { connect } from 'react-redux'
import { getData as getAuthorizations } from 'decentraland-dapps/dist/modules/authorization/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionPublishButton.types'
import CollectionPublishButton from './CollectionPublishButton'

const mapState = (state: RootState): MapStateProps => {
  return {
    wallet: getWallet(state)!,
    authorizations: getAuthorizations(state)
  }
}

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => {
  const { collection, items } = ownProps
  const collectionId = collection.id
  const itemIds = items.map(item => item.id)
  return {
    onPublish: () => dispatch(openModal('PublishThirdPartyCollectionModal', { collectionId, itemIds }))
  }
}

export default connect(mapState, mapDispatch)(CollectionPublishButton)
