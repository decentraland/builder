import { select, put, race, take } from 'redux-saga/effects'
import {
  loadManifestRequest,
  LoadManifestFailureAction,
  LoadManifestSuccessAction,
  LOAD_MANIFEST_SUCCESS,
  LOAD_MANIFEST_FAILURE
} from 'modules/project/actions'
import { getData as getProjects } from 'modules/project/selectors'
import { getData as getScenes } from 'modules/scene/selectors'
import { SCRIPT_INSTANCE_NAME } from 'modules/project/export'
import { AssetParameter, AssetParameterValues, AssetParameterType, AssetActionValue, Asset, GROUND_CATEGORY } from 'modules/asset/types'
import { PreviewType } from 'modules/editor/types'
import { Vector3 } from 'modules/models/types'
import { ComponentType, ComponentDefinition, AnyComponent, EntityDefinition, SceneSDK6 } from './types'

export function snapToGrid(position: Vector3, grid = 0.5): Vector3 {
  return {
    x: Math.round(position.x / grid) * grid,
    y: Math.round(position.y / grid) * grid,
    z: Math.round(position.z / grid) * grid
  }
}

export function snapToBounds(position: Vector3, bounds: Vector3): Vector3 {
  return {
    x: Math.max(Math.min(position.x, bounds.x), 0),
    y: Math.max(Math.min(position.y, bounds.y), 0),
    z: Math.max(Math.min(position.z, bounds.z), 0)
  }
}

export function* getSceneByProjectId(projectId: string, type: PreviewType = PreviewType.PROJECT) {
  const projects: ReturnType<typeof getProjects> = yield select(getProjects)
  const scenes: ReturnType<typeof getScenes> = yield select(getScenes)
  const project = projects[projectId]
  let scene = project && scenes[project.sceneId]

  if (!scene) {
    yield put(loadManifestRequest(projectId, type))
    const result: { success?: LoadManifestSuccessAction; failure?: LoadManifestFailureAction } = yield race({
      success: take(LOAD_MANIFEST_SUCCESS),
      failure: take(LOAD_MANIFEST_FAILURE)
    })
    if (result.success) {
      scene = result.success.payload.manifest.scene
    } else if (result.failure) {
      throw new Error(result.failure.payload.error)
    }
  }
  return scene
}

export function getEntityName(scene: SceneSDK6, entityComponents: EntityDefinition['components'], assets: Record<string, Asset>) {
  const takenNames = new Set<string>()
  const components = entityComponents.map(id => scene.components[id])

  for (const entityId in scene.entities) {
    const entity = scene.entities[entityId]
    takenNames.add(entity.name)
  }
  return getUniqueName(components, takenNames, assets)
}

export function getUniqueName(components: AnyComponent[], takenNames: Readonly<Set<string>>, assets: Record<string, Asset>) {
  let attempts = 1
  let rawName = 'entity'

  for (const component of components) {
    try {
      if (component.type === ComponentType.GLTFShape) {
        const asset = assets[(component as ComponentDefinition<ComponentType.GLTFShape>).data.assetId]
        if (asset) {
          const match = asset.name.match(/[A-Za-z]+/g)
          rawName = convertToCamelCase(match ? match.join('_') : rawName)
        }
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

export function convertToCamelCase(name: string) {
  return name
    .replace(/\s/g, '_')
    .split('_')
    .map((part, i) => {
      if (part.length === 0) return ''

      if (i === 0) {
        return part.toLowerCase()
      } else {
        if (part.length === 1) {
          return part.toUpperCase()
        }
        return part.charAt(0).toUpperCase() + part.slice(1)
      }
    })
    .join('')
}

export function getGLTFShapeName(component: ComponentDefinition<ComponentType.GLTFShape>) {
  const src = (component.data as any).src
  if (!src) {
    throw Error('Invalid name')
  }
  const name = convertToCamelCase(
    src // path/to/ModelName.glb
      .split('/') // ["path", "to", "ModelName.glb"]
      .pop()! // "ModelName.glb"
      .split('.') // ["ModelName", "glb"]
      .shift()! // "ModelName"
      .replace(/\d*$/, '')
  )

  if (!name || name === SCRIPT_INSTANCE_NAME) {
    throw Error('Invalid name')
  }

  return name
}

export function getDefaultValues(entityName: string, parameters: AssetParameter[], assetsByEntityName: Record<string, Asset>) {
  const out: AssetParameterValues = {}

  for (const parameter of parameters) {
    const hasDefault = parameter.default !== undefined && parameter.default !== ''

    if (parameter.type === AssetParameterType.ACTIONS) {
      if (hasDefault) {
        const asset = assetsByEntityName[entityName]
        const action = asset && asset.actions.find(action => action.id === parameter.id)
        out[parameter.id] = [
          {
            entityName,
            actionId: parameter.default,
            values: action ? getDefaultValues(entityName, action.parameters, assetsByEntityName) : {}
          }
        ] as AssetActionValue[]
      }
    } else if (parameter.type === AssetParameterType.ENTITY) {
      const name = Object.keys(assetsByEntityName).find(entity => {
        if (assetsByEntityName[entity]) {
          return entity !== entityName && assetsByEntityName[entity].category !== GROUND_CATEGORY
        }
        return false
      })!
      out[parameter.id] = name || entityName
    } else {
      if (hasDefault) {
        out[parameter.id] = parameter.default!
      }
    }
  }

  return out
}

/**
 * Swaps all references to `oldName` for `newName` inside a script's actions.
 *
 * Mutates the object.
 *
 * @param parameters The Asset parameters
 * @param values The AssetParameterValues corresponding to the script component data or any of the child action values
 * @param oldName The entity name to be changed
 * @param newName The entity name that will replace `oldName`
 */
export function renameEntity(parameters: AssetParameter[], values: AssetParameterValues, oldName: string, newName: string) {
  for (const parameter of parameters) {
    if (parameter.type === AssetParameterType.ACTIONS) {
      const value = values[parameter.id] as AssetActionValue[] | undefined
      if (value) {
        for (let i = 0; i < value.length; i++) {
          const action = value[i]
          if (action.entityName === oldName) {
            action.entityName = newName
          }
          renameEntity(parameters, action.values, oldName, newName)
        }
      }
    } else if (parameter.type === AssetParameterType.ENTITY) {
      if (values[parameter.id] === oldName) {
        values[parameter.id] = newName
      }
    }
  }
}

/**
 * Removes all actions that depend on the provided entity name
 *
 * Mutates the object.
 *
 * @param parameters The Asset parameters
 * @param values The AssetParameterValues corresponding to the script component data or any of the child action values
 * @param oldName The entity name
 */
export function removeEntityReferences(parameters: AssetParameter[], values: AssetParameterValues, entityName: string) {
  for (const parameter of parameters) {
    if (parameter.type === AssetParameterType.ACTIONS) {
      const value = values[parameter.id] as AssetActionValue[] | undefined
      if (value) {
        for (let i = 0; i < value.length; i++) {
          const action = value[i]
          if (action.entityName === entityName) {
            value.splice(i, 1)
            continue
          }
          removeEntityReferences(parameters, action.values, entityName)
        }
      }
    } else if (parameter.type === AssetParameterType.ENTITY) {
      if (values[parameter.id] === entityName) {
        delete values[parameter.id]
      }
    }
  }
}
