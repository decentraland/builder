import { Vector3 } from 'modules/common/types'
import { Scene, SceneMetrics } from './types'
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

/**
 * Returns a new random position bound to y: 0
 * Can be overriden using the position argument
 */
export function getRandomPosition(position: Partial<Vector3> = {}) {
  const x = Math.floor(Math.random() * 6) + 1
  const z = Math.floor(Math.random() * 6) + 1
  return { x, y: 0, z, ...position }
}

export function isWithinBounds(position: Vector3, bounds: Vector3) {
  return position.x <= bounds.x && position.y <= bounds.y && position.z <= bounds.z && position.x >= 0 && position.y >= 0 && position.z >= 0
}

// Note: if we start making extensive use of scene cloning we may replace this by a proper deep clone
export function cloneEntities(scene: Scene) {
  return Object.keys(scene.entities).reduce<Scene['entities']>(
    (entities, entityId) => ({
      ...entities,
      [entityId]: { ...scene.entities[entityId], components: [...scene.entities[entityId].components] }
    }),
    {}
  )
}

export function filterEntitiesWithComponent(componentId: string, entities: Scene['entities']): Scene['entities'] {
  const newEntities: Scene['entities'] = {}

  for (let id in entities) {
    const entity = entities[id]
    const index = entity.components.indexOf(componentId)

    if (index === -1) {
      newEntities[id] = entity
    }
  }

  return newEntities
}

export function getExceededMetrics(metrics: SceneMetrics, limits: SceneMetrics) {
  const metricsExceeded: (keyof SceneMetrics)[] = []

  for (const key in metrics) {
    const metric = key as keyof SceneMetrics
    if (metrics[metric] > limits[metric]) {
      if (!metricsExceeded.includes(metric)) {
        metricsExceeded.push(metric)
      }
    }
  }

  return metricsExceeded
}

export function snapToGrid(position: Vector3, grid: number = 0.5): Vector3 {
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

export function areEqualMappings(mappingsA: Record<string, string> = {}, mappingsB: Record<string, string> = {}) {
  for (const keyA of Object.keys(mappingsA)) {
    if (mappingsA[keyA] !== mappingsB[keyA]) {
      return false
    }
  }
  for (const keyB of Object.keys(mappingsB)) {
    if (mappingsA[keyB] !== mappingsB[keyB]) {
      return false
    }
  }
  return true
}

export function* getSceneByProjectId(projectId: string) {
  const projects: ReturnType<typeof getProjects> = yield select(getProjects)
  const scenes: ReturnType<typeof getScenes> = yield select(getScenes)
  let project = projects[projectId]
  if (!project) {
    throw new Error(`Project with id "${projectId}" not found in store`)
  }
  let scene = scenes[project.sceneId]
  if (!scene) {
    yield put(loadManifestRequest(project.id))
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
