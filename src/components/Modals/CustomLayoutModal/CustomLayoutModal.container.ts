import { connect } from 'react-redux'
import { navigateTo } from 'decentraland-dapps/dist/modules/location/actions'

import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { closeModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CustomLayoutModal.types'
import ShortcutsModal from './CustomLayoutModal'
import { createProjectFromTemplate } from 'modules/project/actions'

const mapState = (_: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClose: name => dispatch(closeModal(name)),
  onCreateProject: template =>
    dispatch(
      createProjectFromTemplate(template, {
        onSuccess: project => dispatch(navigateTo(locations.editor(project.id)))
      })
    )
})

export default connect(
  mapState,
  mapDispatch
)(ShortcutsModal)
