import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { useGetTemplateIdFromCurrentUrl } from 'modules/location/hooks'
import { getLoading, getTemplates } from 'modules/project/selectors'
import { LOAD_PROJECTS_REQUEST, loadProjectSceneRequest } from 'modules/project/actions'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { getData as getScenes } from 'modules/scene/selectors'
import { PreviewType } from 'modules/editor/types'
import TemplateDetailPage from './TemplateDetailPage'

const TemplateDetailPageContainer: React.FC = () => {
  const dispatch = useDispatch()
  const templateId = useGetTemplateIdFromCurrentUrl()

  const template = useSelector((state: RootState) => {
    return templateId ? getTemplates(state)[templateId] || null : null
  })
  const scene = useSelector((state: RootState) => {
    return template ? getScenes(state)[template.sceneId] || null : null
  })
  const isLoading = useSelector((state: RootState) => isLoadingType(getLoading(state), LOAD_PROJECTS_REQUEST))

  const onOpenModal: ActionFunction<typeof openModal> = useCallback((name, metadata) => dispatch(openModal(name, metadata)), [dispatch])
  const onLoadTemplateScene: ActionFunction<typeof loadProjectSceneRequest> = useCallback(
    project => dispatch(loadProjectSceneRequest(project, PreviewType.TEMPLATE)),
    [dispatch]
  )

  return (
    <TemplateDetailPage
      template={template}
      scene={scene}
      isLoading={isLoading}
      onOpenModal={onOpenModal}
      onLoadTemplateScene={onLoadTemplateScene}
    />
  )
}

export default TemplateDetailPageContainer
