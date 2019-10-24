import { connect } from 'react-redux'

import { RootState } from 'modules/common/types'
import { isLoading, isReady } from 'modules/editor/selectors'
import { openModal } from 'modules/modal/actions'
import { getCurrentProject } from 'modules/project/selectors'

import ShareButton from './ShareButton'
import { MapDispatch, MapDispatchProps, MapStateProps } from './ShareButton.types'


const mapState = (state: RootState): MapStateProps => ({
  project: getCurrentProject(state)!,
  isLoading: !isReady(state) || isLoading(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(
  mapState,
  mapDispatch
)(ShareButton)
