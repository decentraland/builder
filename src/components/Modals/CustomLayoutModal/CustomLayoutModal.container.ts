import { connect } from 'react-redux'
import { navigateTo } from 'decentraland-dapps/dist/modules/location/actions'

import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { createProjectFromTemplate } from 'modules/project/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CustomLayoutModal.types'
import CustomLayoutModal from './CustomLayoutModal'

const mapState = (_: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
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
)(CustomLayoutModal)
