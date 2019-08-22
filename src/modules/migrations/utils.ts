import { Project } from 'modules/project/types'
import { Deployment } from 'modules/deployment/types'
import { Migration, Versionable } from './types'

export function toProjectCloudSchema(project: Project): Project {
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

export function toDeploymentCloudSchema(id: string, deployment: Deployment): Deployment {
  return {
    ...deployment,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export function runMigrations<T extends Versionable>(input: T, migrations: Migration<T>) {
  let out: T = input
  let version = out.version || 1
  const latestVersion = parseInt(Object.keys(migrations).slice(-1)[0], 10)

  while (version < latestVersion) {
    version++
    if (version in migrations) {
      out = migrations[version](out)
      out.version = version
    }
  }

  return out
}
