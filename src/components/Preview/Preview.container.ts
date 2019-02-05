import { connect } from 'react-redux'

import { openEditor } from 'modules/editor/actions'

import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatch, MapDispatchProps } from './Preview.types'
import { isReady } from 'modules/editor/selectors'
import { getProjectLayout } from 'modules/project/selectors'
import Preview from './Preview'

const mapState = (state: RootState): MapStateProps => ({
  isLoading: isReady(state),
  layout: getProjectLayout(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenEditor: () => dispatch(openEditor())
})

export default connect(
  mapState,
  mapDispatch
)(Preview)
