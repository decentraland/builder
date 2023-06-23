import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getTemplates } from 'modules/project/selectors'
import { loadTemplatesRequest } from 'modules/project/actions'
import { MapDispatchProps, MapDispatch, MapStateProps } from './TemplatesPage.types'
import { TemplatesPage } from './TemplatesPage'

const mapState = (state: RootState): MapStateProps => ({
  templates: getTemplates(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onLoadTemplates: () => dispatch(loadTemplatesRequest()),
  onNavigate: (path: string) => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(TemplatesPage)
