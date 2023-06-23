import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getTemplateId } from 'modules/location/selectors'
import { getLoading } from 'modules/project/selectors'
import { LOAD_PROJECTS_REQUEST, duplicateProject } from 'modules/project/actions'
import { openModal } from 'modules/modal/actions'
import { Project } from 'modules/project/types'
import templates from '../TemplatesPage/templates.json'
import { MapStateProps, MapDispatchProps, MapDispatch } from './TemplateDetailPage.types'
import TemplateDetailPage from './TemplateDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const templateId = getTemplateId(state)
  const template = templates.find(template => template.id === templateId)
  return {
    template: template ? (template as Project) : null,
    isLoading: isLoadingType(getLoading(state), LOAD_PROJECTS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onDuplicate: project => dispatch(duplicateProject(project))
})

export default connect(mapState, mapDispatch)(TemplateDetailPage)
