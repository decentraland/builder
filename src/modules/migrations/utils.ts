import { Project } from 'modules/project/types'
import { Migration, Versionable } from './types'
import { ComponentType, ComponentDefinition, AnyComponent, Scene, SceneSDK6, SceneSDK7 } from 'modules/scene/types'
import { getGLTFShapeName, getUniqueName } from 'modules/scene/utils'

export function addScale(scene: SceneSDK6) {
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

export function getUniqueNameLegacy(components: AnyComponent[], takenNames: Readonly<Set<string>>) {
  let attempts = 1
  let rawName = 'entity'

  for (const component of components) {
    try {
      if (component.type === ComponentType.GLTFShape) {
        rawName = getGLTFShapeName(component as ComponentDefinition<ComponentType.GLTFShape>)
      } else if (component.type === ComponentType.NFTShape) {
        rawName = 'nft'
      }
    } catch (e) {
      // swallow
    }
  }

  let name = rawName
  while (takenNames.has(name)) {
    name = `${rawName}${++attempts}`
  }

  return name
}

export function addEntityName(scene: SceneSDK6) {
  const takenNames = new Set<string>()

  for (const entityId in scene.entities) {
    const entity = scene.entities[entityId]
    const components = entity.components.map(id => scene.components[id])
    const name = getUniqueNameLegacy(components, takenNames)
    takenNames.add(name)
    entity.name = name
  }
}

export function addAssets(scene: SceneSDK6) {
  if (!scene.assets) {
    scene.assets = {}
  }
}

export function removeScriptSrc(scene: SceneSDK6) {
  const scripts = Object.values(scene.components).filter(component => component.type === ComponentType.Script)
  for (const script of scripts) {
    delete (script.data as any).src
  }
}

export function sanitizeEntityName(scene: SceneSDK6) {
  const takenNames = new Set<string>()

  for (const entityId in scene.entities) {
    const entity = scene.entities[entityId]
    if (/^\d/.exec(entity.name)) {
      const components = entity.components.map(id => scene.components[id])
      const name = getUniqueName(components, takenNames, scene.assets)
      takenNames.add(name)
      entity.name = name
    }
  }
}

export function sanitizeEntityName2(scene: SceneSDK6) {
  const takenNames = new Set<string>()

  for (const entityId in scene.entities) {
    const entity = scene.entities[entityId]
    // If the name is not a letter followed by more letters and numbers, then we need to update it
    if (entity.name.match(/^[A-Za-z][A-Za-z\d]+$/g) === null) {
      const components = entity.components.map(id => scene.components[id])
      const name = getUniqueName(components, takenNames, scene.assets)
      takenNames.add(name)
      entity.name = name
    }
  }
}

export function dedupeEntityName(scene: SceneSDK6) {
  const takenNames = new Set<string>()
  for (const entityId in scene.entities) {
    const entity = scene.entities[entityId]
    const components = entity.components.map(id => scene.components[id])
    const name = getUniqueName(components, takenNames, scene.assets)
    takenNames.add(name)
    entity.name = name
  }
}

export function replaceUserIdWithEthAddress(project: Project) {
  delete (project as any).userId
  if (typeof project.ethAddress === 'undefined') {
    project.ethAddress = null
  }
}

export function wrapSdk6(scene: SceneSDK6): Scene {
  return {
    sdk6: scene,
    sdk7: null
  }
}

export function wrapSdk7(scene: SceneSDK7): Scene {
  return {
    sdk6: null,
    sdk7: scene
  }
}
