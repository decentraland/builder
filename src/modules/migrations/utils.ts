import { Project } from 'modules/project/types'

export function toCloudSchema(project: Project) {
  const newProject = {
    ...project,
    userId: null,
    createdAt: new Date(project.createdAt).toISOString(),
    updatedAt: new Date().toISOString()
  }
  delete (newProject as any).ownerEmail
  delete (newProject as any).parcels
  return newProject
}
