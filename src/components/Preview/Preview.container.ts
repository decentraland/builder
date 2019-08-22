import { connect } from 'react-redux'

import { openEditor } from 'modules/editor/actions'
import { RootState } from 'modules/common/types'
import { isReady } from 'modules/editor/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { dropItem } from 'modules/scene/actions'
import { MapStateProps, MapDispatch, MapDispatchProps } from './Preview.types'
import Preview from './Preview'

const mapState = (state: RootState): MapStateProps => ({
  isLoading: !isReady(state),
  project: getCurrentProject(state)!
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenEditor: () => dispatch(openEditor()),
  onDropItem: (asset, x, y) => dispatch(dropItem(asset, x, y))
})

export default connect(
  mapState,
  mapDispatch
)(Preview)
