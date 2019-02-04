import { connect } from 'react-redux'

import { openEditor } from 'modules/editor/actions'

import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatch, MapDispatchProps } from './Preview.types'
import Preview from './Preview'
import { getReadyState } from 'modules/editor/selectors'

const mapState = (state: RootState): MapStateProps => ({
  isLoading: getReadyState(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenEditor: () => dispatch(openEditor())
})

export default connect(
  mapState,
  mapDispatch
)(Preview)
