import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getTemplateId } from 'modules/location/selectors'
import { getLoading, getTemplates } from 'modules/project/selectors'
import { LOAD_PROJECTS_REQUEST, loadProjectSceneRequest } from 'modules/project/actions'
import { openModal } from 'modules/modal/actions'
import { getData as getScenes } from 'modules/scene/selectors'
import { PreviewType } from 'modules/editor/types'
import { Project } from 'modules/project/types'
import { getIsInspectorEnabled } from 'modules/features/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './TemplateDetailPage.types'
import TemplateDetailPage from './TemplateDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const templateId = getTemplateId(state)
  const template = templateId && getTemplates(state)[templateId]
  const scene = template ? getScenes(state)[template.sceneId] : null
  return {
    template: template ? template : null,
    scene,
    isLoading: isLoadingType(getLoading(state), LOAD_PROJECTS_REQUEST),
    isInspectorEnabled: getIsInspectorEnabled(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onLoadTemplateScene: (project: Project) => dispatch(loadProjectSceneRequest(project, PreviewType.TEMPLATE))
})

export default connect(mapState, mapDispatch)(TemplateDetailPage)
