import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getIsUnityWearablePreviewEnabled } from 'modules/features/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './EditThumbnailStep.types'
import EditThumbnailStep from './EditThumbnailStep'

const mapState = (state: RootState): MapStateProps => {
  return {
    isUnityWearablePreviewEnabled: getIsUnityWearablePreviewEnabled(state)
  }
}

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect<MapStateProps, MapDispatchProps, OwnProps, RootState>(mapState, mapDispatch)(EditThumbnailStep)
