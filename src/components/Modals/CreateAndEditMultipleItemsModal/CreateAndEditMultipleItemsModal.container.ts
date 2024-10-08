import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { cancelSaveMultipleItems, saveMultipleItemsRequest, clearSaveMultipleItems } from 'modules/item/actions'
import {
  getSavedItemsFiles,
  getMultipleItemsSaveState,
  getProgress,
  getNotSavedItemsFiles,
  getCanceledItemsFiles
} from 'modules/ui/createMultipleItems/selectors'
import { getError } from 'modules/item/selectors'
import { Collection } from 'modules/collection/types'
import { getCollection } from 'modules/collection/selectors'
import { getIsLinkedWearablesPaymentsEnabled, getIsLinkedWearablesV2Enabled } from 'modules/features/selectors'
import { setThirdPartyKindRequest } from 'modules/thirdParty/actions'
import { getCollectionThirdParty, isSettingThirdPartyType } from 'modules/thirdParty/selectors'
import { isTPCollection } from 'modules/collection/utils'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CreateAndEditMultipleItemsModal.types'
import { CreateAndEditMultipleItemsModal } from './CreateAndEditMultipleItemsModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const collection: Collection | null = ownProps.metadata.collectionId ? getCollection(state, ownProps.metadata.collectionId) : null
  const thirdParty = collection && isTPCollection(collection) ? getCollectionThirdParty(state, collection) : null

  return {
    collection,
    thirdParty,
    isSettingThirdPartyType: isSettingThirdPartyType(state),
    error: getError(state),
    savedItemsFiles: getSavedItemsFiles(state),
    notSavedItemsFiles: getNotSavedItemsFiles(state),
    cancelledItemsFiles: getCanceledItemsFiles(state),
    saveMultipleItemsState: getMultipleItemsSaveState(state),
    isLinkedWearablesV2Enabled: getIsLinkedWearablesV2Enabled(state),
    isLinkedWearablesPaymentsEnabled: getIsLinkedWearablesPaymentsEnabled(state),
    saveItemsProgress: getProgress(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetThirdPartyType: (thirdPartyId: string, isProgrammatic: boolean) => dispatch(setThirdPartyKindRequest(thirdPartyId, isProgrammatic)),
  onSaveMultipleItems: builtItems => dispatch(saveMultipleItemsRequest(builtItems)),
  onCancelSaveMultipleItems: () => dispatch(cancelSaveMultipleItems()),
  onModalUnmount: () => dispatch(clearSaveMultipleItems())
})

export default connect(mapState, mapDispatch)(CreateAndEditMultipleItemsModal)
