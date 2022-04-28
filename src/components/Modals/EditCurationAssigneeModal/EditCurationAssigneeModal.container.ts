import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getCommitteeMembers } from 'modules/committee/selectors'
import {
  setCollectionCurationAssigneeRequest,
  SET_COLLECTION_CURATION_ASSIGNEE_REQUEST
} from 'modules/curations/collectionCuration/actions'
import { getCurationsByCollectionId, getLoading } from 'modules/curations/collectionCuration/selectors'
import { getCollection } from 'modules/collection/selectors'
import { MapDispatch, MapDispatchProps, OwnProps, MapState } from './EditCurationAssigneeModal.types'
import EditCurationAssigneeModal from './EditCurationAssigneeModal'

const mapState = (state: RootState, ownProps: OwnProps): MapState => ({
  collection: getCollection(state, ownProps.metadata.collectionId),
  curation: getCurationsByCollectionId(state)[ownProps.metadata.collectionId],
  committeeMembers: getCommitteeMembers(state),
  isLoading: isLoadingType(getLoading(state), SET_COLLECTION_CURATION_ASSIGNEE_REQUEST),
  address: getAddress(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetAssignee: (collectionId, assignee, curation) => dispatch(setCollectionCurationAssigneeRequest(collectionId, assignee, curation))
})

export default connect(mapState, mapDispatch)(EditCurationAssigneeModal)
