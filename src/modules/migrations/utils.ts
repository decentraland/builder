import { Project } from 'modules/project/types'
import { Deployment } from 'modules/deployment/types'
import { Migration, Versionable } from './types'
import { Scene, ComponentType, ComponentDefinition } from 'modules/scene/types'
import { getUniqueName } from 'modules/scene/utils'

export function addScale(scene: Scene) {
  if (scene) {
    for (const component of Object.values(scene.components)) {
      if (component.type === ComponentType.Transform) {
        const transform = component as ComponentDefinition<ComponentType.Transform>
        if (!transform.data.scale) {
          transform.data.scale = { x: 1, y: 1, z: 1 }
        }
      }
    }
  }
}

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

export function addEntityName(scene: Scene) {
  const takenNames = new Set()

  for (let entityId in scene.entities) {
    const entity = scene.entities[entityId]
    const components = entity.components.map(id => scene.components[id])
    const name = getUniqueName(components, takenNames)
    takenNames.add(name)
    entity.name = name
  }
}
