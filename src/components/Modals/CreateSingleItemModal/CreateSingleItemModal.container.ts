import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { saveItemRequest, SAVE_ITEM_REQUEST } from 'modules/item/actions'
import { getLoading, getError } from 'modules/item/selectors'
import { getCollection } from 'modules/collection/selectors'
import { Collection, CollectionType } from 'modules/collection/types'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CreateSingleItemModal.types'
import CreateSingleItemModal from './CreateSingleItemModal'
import { getCollectionType } from 'modules/collection/utils'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const collection: Collection | null = ownProps.metadata.collectionId ? getCollection(state, ownProps.metadata.collectionId) : null
  const collectionUrn: string | null =
    collection?.urn && getCollectionType(collection) === CollectionType.THIRD_PARTY ? collection.urn : null

  return {
    address: getAddress(state),
    collectionUrn,
    error: getError(state),
    isLoading: isLoadingType(getLoading(state), SAVE_ITEM_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSave: (item, contents) => dispatch(saveItemRequest(item, contents))
})

export default connect(mapState, mapDispatch)(CreateSingleItemModal)
