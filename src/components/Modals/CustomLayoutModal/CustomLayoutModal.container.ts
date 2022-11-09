import { connect } from 'react-redux'
import { push } from 'connected-react-router'

import { locations } from 'routing/locations'
import { createProjectFromTemplate } from 'modules/project/actions'
import { MapDispatchProps, MapDispatch } from './CustomLayoutModal.types'
import CustomLayoutModal from './CustomLayoutModal'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onCreateProject: (name, description, template) =>
    dispatch(
      createProjectFromTemplate(template, {
        title: name,
        description,
        onSuccess: project => dispatch(push(locations.sceneEditor(project.id)))
      })
    )
})

export default connect(null, mapDispatch)(CustomLayoutModal)
