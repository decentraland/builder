import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import * as queryString from 'query-string'

import { RootState } from 'modules/common/types'
import { getData as getProjects } from 'modules/project/selectors'
import EditorPage from './EditorPage'
import { Props, MapStateProps, QueryParams } from './EditorPage.types'

const mapState = (state: RootState, ownProps: Props): MapStateProps => {
  const { projectId } = queryString.parse(ownProps.location.search) as QueryParams
  let project = undefined

  if (projectId) {
    project = getProjects(state)[projectId]
  }

  return {
    project
  }
}

const mapDispatch = () => undefined

export default withRouter(
  connect(
    mapState,
    mapDispatch
  )(EditorPage)
)
