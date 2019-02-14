import { connect } from 'react-redux'
import { navigateTo } from 'decentraland-dapps/dist/modules/location/actions'

import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { Template } from 'modules/template/types'
import { openModal } from 'modules/modal/actions'
import { getData as getProjects } from 'modules/project/selectors'
import { createProjectFromTemplate } from 'modules/project/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './HomePage.types'
import HomePage from './HomePage'

const mapState = (state: RootState): MapStateProps => ({
  projects: getProjects(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onCreateProject: (template: Template) =>
    dispatch(
      createProjectFromTemplate(template, {
        onSuccess(project) {
          dispatch(navigateTo(locations.editor(project.id)))
        }
      })
    ),
  onOpenModal: name => dispatch(openModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(HomePage)
