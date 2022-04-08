import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { buildThirdPartyURN, DecodedURN, URNType } from 'lib/urn'
import { getLoading as getCollectionLoading, getError } from 'modules/collection/selectors'
import { saveCollectionRequest, SAVE_COLLECTION_REQUEST } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './EditCollectionURNModal.types'
import EditURNModal from '../EditURNModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collection } = ownProps.metadata
  return {
    elementName: collection.name,
    urn: collection.urn,
    error: getError(state),
    isLoading: isLoadingType(getCollectionLoading(state), SAVE_COLLECTION_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => ({
  onSave: urn => dispatch(saveCollectionRequest({ ...ownProps.metadata.collection, urn })),
  onBuildURN: (decodedURN: DecodedURN<URNType.COLLECTIONS_THIRDPARTY>, collectionId: string) =>
    buildThirdPartyURN(decodedURN.thirdPartyName, collectionId)
})

export default connect(mapState, mapDispatch)(EditURNModal)
