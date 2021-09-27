import { connect } from 'react-redux'
import { getData as getAuthorizations } from 'decentraland-dapps/dist/modules/authorization/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { getCollection, getCollectionItems, getStatusByCollectionId } from 'modules/collection/selectors'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionAction.types'
import CollectionAction from './CollectionAction'
import { fetchCurationRequest } from 'modules/curation/actions'
import { getIsValidCuration } from 'modules/curation/selectors'

const mapState = (state: RootState): MapStateProps => {
  const collectionId = getCollectionId(state) || ''
  const collection = getCollection(state, collectionId)!
  const statusByCollectionId = getStatusByCollectionId(state)

  return {
    wallet: getWallet(state)!,
    collection,
    items: getCollectionItems(state, collectionId),
    authorizations: getAuthorizations(state),
    status: statusByCollectionId[collection.id],
    isAwaitingCuration: getIsValidCuration(state, collection.id)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (collectionId: string) => dispatch(openModal('PublishCollectionModal', { collectionId })),
  onPush: (collectionId: string) => dispatch(openModal('PushCollectionChangesModal', { collectionId })),
  onInit: (collectionId: string) => dispatch(fetchCurationRequest(collectionId))
})

const merge = (stateProps: MapStateProps, dispatchProps: MapDispatchProps) => {
  const { id: collectionId } = stateProps.collection
  
  return {
    ...stateProps,
    ...dispatchProps,
    onPublish: () => dispatchProps.onPublish(collectionId),
    onPush: () => dispatchProps.onPush(collectionId),
    onInit: () => dispatchProps.onInit(collectionId)
  }
}

export default connect(mapState, mapDispatch, merge)(CollectionAction)
