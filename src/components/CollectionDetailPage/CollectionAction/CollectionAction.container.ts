import { connect } from 'react-redux'
import { getData as getAuthorizations } from 'decentraland-dapps/dist/modules/authorization/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { getCollection, getCollectionItems, getStatusByCollectionId } from 'modules/collection/selectors'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionAction.types'
import CollectionAction from './CollectionAction'

const mapState = (state: RootState): MapStateProps => {
  const collectionId = getCollectionId(state) || ''
  const collection = getCollection(state, collectionId)!
  const statusByCollectionId = getStatusByCollectionId(state)

  return {
    wallet: getWallet(state)!,
    collection,
    items: getCollectionItems(state, collectionId),
    authorizations: getAuthorizations(state),
    status: statusByCollectionId[collection.id]
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (collectionId: string) => dispatch(openModal('PublishCollectionModal', { collectionId }))
})

const merge = (stateProps: MapStateProps, dispatchProps: MapDispatchProps) => ({
  ...stateProps,
  onPublish: () => dispatchProps.onPublish(stateProps.collection.id)
})

export default connect(mapState, mapDispatch, merge)(CollectionAction)
