import { connect } from 'react-redux'
import { getData as getAuthorizations } from 'decentraland-dapps/dist/modules/authorization/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { getCollection, getCollectionItems } from 'modules/collection/selectors'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionAction.types'
import CollectionAction from './CollectionAction'

const mapState = (state: RootState): MapStateProps => {
  const collectionId = getCollectionId(state) || ''

  return {
    wallet: getWallet(state)!,
    collection: getCollection(state, collectionId)!,
    items: getCollectionItems(state, collectionId),
    authorizations: getAuthorizations(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (collectionId: string) => dispatch(openModal('PublishCollectionModal', { collectionId }))
})

export default connect(mapState, mapDispatch)(CollectionAction)
