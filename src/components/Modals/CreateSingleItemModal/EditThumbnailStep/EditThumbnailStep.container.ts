import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
// import { OwnProps } from './EditThumbnailStep.types'
import EditThumbnailStep from './EditThumbnailStep'
import { getIsEmotesFlowEnabled } from 'modules/features/selectors'

const mapState = (state: RootState) => {
  // const collection: Collection | null = ownProps.metadata.collectionId ? getCollection(state, ownProps.metadata.collectionId) : null

  return {
    // collection,
    // address: getAddress(state),
    // error: getError(state),
    // isLoading: isLoadingType(getLoading(state), SAVE_ITEM_REQUEST),
    isEmotesFeatureFlagOn: getIsEmotesFlowEnabled(state)
  }
}

// const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
//   onSave: (item, contents) => dispatch(saveItemRequest(item, contents))
// })

export default connect(mapState, null)(EditThumbnailStep)
