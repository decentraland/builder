import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getPushChangesUpdateProgress } from 'modules/ui/thirdparty/selectors'
import { MapStateProps } from './PublishingStep.types'
import { PublishingStep } from './PublishingStep'

const mapState = (state: RootState): MapStateProps => {
  return {
    pushChangesProgress: getPushChangesUpdateProgress(state)
  }
}

export default connect(mapState)(PublishingStep)
