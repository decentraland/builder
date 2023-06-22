import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Project, TemplateStatus } from 'modules/project/types'

export const mockTemplate: Project = {
  id: 'templateId',
  title: 'templateTitle',
  description: 'templateDescription',
  thumbnail: 'templateThumbnail',
  isPublic: true,
  sceneId: 'templateSceneId',
  ethAddress: '0xa',
  createdAt: '0',
  updatedAt: '0',
  layout: { rows: 1, cols: 1 },
  isTemplate: true,
  video: 'templateVideo',
  templateStatus: TemplateStatus.AVAILABLE
}

export const mockTemplates: ModelById<Project> = { [mockTemplate.id]: mockTemplate }
