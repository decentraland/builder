import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { buildThirdPartyURN, DecodedURN, URNType } from 'lib/urn'
import { getLoading as getItemLoading } from 'modules/item/selectors'
import { saveItemRequest, SAVE_ITEM_REQUEST } from 'modules/item/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './EditItemURNModal.types'
import EditURNModal from '../EditURNModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { item } = ownProps.metadata
  return {
    elementName: item.name,
    urn: item.urn,
    isLoading: isLoadingType(getItemLoading(state), SAVE_ITEM_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => ({
  onSave: (urn: string) => dispatch(saveItemRequest({ ...ownProps.metadata.item, urn }, {})),
  onBuildURN: (decodedURN: DecodedURN<URNType.COLLECTIONS_THIRDPARTY>, tokenId: string) =>
    buildThirdPartyURN(decodedURN.thirdPartyName, decodedURN.thirdPartyCollectionId!, tokenId)
})

export default connect(mapState, mapDispatch)(EditURNModal)
