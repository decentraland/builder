import { connect } from 'react-redux'
import { push } from 'connected-react-router'

import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { createProjectFromTemplate } from 'modules/project/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CustomLayoutModal.types'
import CustomLayoutModal from './CustomLayoutModal'

const mapState = (_: RootState): MapStateProps => ({})

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

export default connect(mapState, mapDispatch)(CustomLayoutModal)
