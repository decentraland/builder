import { connect } from 'react-redux'
// import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
// import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
// import { RootState } from 'modules/common/types'
// import { getCollection, getCollectionItems, getLoading } from 'modules/collection/selectors'
// import { publishCollectionRequest, PUBLISH_COLLECTION_REQUEST } from 'modules/collection/actions'
// import { fetchRaritiesRequest, FETCH_RARITIES_REQUEST } from 'modules/item/actions'
// import { getRarities } from 'modules/item/selectors'
// import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './PushCollectionChangesModal.types'
import PushCollectionChangesModal from './PushCollectionChangesModal'

// const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
//   const { collectionId } = ownProps.metadata

//   return {
//     wallet: getWallet(state),
//     collection: getCollection(state, collectionId),
//     items: getCollectionItems(state, collectionId),
//     rarities: getRarities(state),
//     isLoading: isLoadingType(getLoading(state), PUBLISH_COLLECTION_REQUEST),
//     isFetchingRarities: isLoadingType(getLoading(state), FETCH_RARITIES_REQUEST)
//   }
// }

// const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
//   onPublish: (collection, items, email) => dispatch(publishCollectionRequest(collection, items, email)),
//   onFetchRarities: () => dispatch(fetchRaritiesRequest())
// })

export default connect(null, null)(PushCollectionChangesModal)
