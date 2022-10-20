import { connect } from 'react-redux'

import { togglePreview } from 'modules/editor/actions'
import { RootState } from 'modules/common/types'
import { isPreviewing } from 'modules/editor/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './ViewPort.types'
import ViewPort from './ViewPort'

const mapState = (state: RootState): MapStateProps => ({
  isPreviewing: isPreviewing(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClosePreview: () => dispatch(togglePreview(false))
})

export default connect(mapState, mapDispatch)(ViewPort)
