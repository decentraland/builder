import { Pool } from 'modules/pool/types'
import { Project } from 'modules/project/types'

export function getProjectToExport(project: Project | Pool | null) {
  if (!project) {
    return null
  }

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    thumbnail: project.thumbnail,
    isPublic: false,
    sceneId: project.sceneId,
    ethAddress: project.ethAddress,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    layout: project.layout,
    isTemplate: false,
    video: project.video,
    templateStatus: null
  }
}
