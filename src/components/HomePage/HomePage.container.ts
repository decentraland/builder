import { connect } from 'react-redux'
import { navigateTo } from 'decentraland-dapps/dist/modules/location/actions'

import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { Template } from 'modules/template/types'
import { openModal } from 'modules/modal/actions'
import { isFetching } from 'modules/project/selectors'
import { createProjectFromTemplate } from 'modules/project/actions'
import { getProjects, getPage, getSortBy, getTotalPages } from 'modules/ui/dashboard/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './HomePage.types'
import HomePage from './HomePage'

const mapState = (state: RootState): MapStateProps => ({
  projects: getProjects(state),
  isFetching: isFetching(state),
  page: getPage(state),
  sortBy: getSortBy(state),
  totalPages: getTotalPages(state)
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
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onPageChange: options => dispatch(navigateTo(locations.root(options)))
})

export default connect(
  mapState,
  mapDispatch
)(HomePage)
