import { connect } from 'react-redux'
import { push } from 'connected-react-router'

import { locations } from 'routing/locations'
import { RootState } from 'modules/common/types'
import { Template } from 'modules/template/types'
import { openModal } from 'modules/modal/actions'
import { isFetching } from 'modules/project/selectors'
import { isLoggedIn, isLoggingIn } from 'modules/identity/selectors'
import { createProjectFromTemplate } from 'modules/project/actions'
import {
  getProjects,
  getPage,
  getSortBy,
  getTotalPages,
  didSync,
  didCreate,
  didMigrate,
  needsMigration
} from 'modules/ui/dashboard/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './HomePage.types'
import HomePage from './HomePage'
import { loginRequest } from 'modules/identity/actions'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'

const mapState = (state: RootState): MapStateProps => ({
  projects: getProjects(state),
  isLoggingIn: isLoggingIn(state) || isConnecting(state),
  isFetching: isFetching(state),
  page: getPage(state),
  sortBy: getSortBy(state),
  totalPages: getTotalPages(state),
  didCreate: didCreate(state),
  didSync: didSync(state),
  didMigrate: didMigrate(state),
  needsMigration: needsMigration(state),
  isLoggedIn: isLoggedIn(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onLogin: () => dispatch(loginRequest()),
  onCreateProject: (template: Template) =>
    dispatch(
      createProjectFromTemplate(template, {
        onSuccess(project) {
          dispatch(push(locations.editor(project.id)))
        }
      })
    ),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onPageChange: options => dispatch(push(locations.root(options))),
  onNavigateToShowcase: () => dispatch(push(locations.poolSearch()))
})

export default connect(mapState, mapDispatch)(HomePage)
