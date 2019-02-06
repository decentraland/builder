import uuidv4 from 'uuid/v4'
import { takeLatest, put, select } from 'redux-saga/effects'
import {
  ADD_ITEM,
  AddItemAction,
  provisionScene,
  RESET_ITEM,
  ResetItemAction,
  UPDATE_TRANSFORM,
  UpdateTransfromAction,
  DUPLICATE_ITEM,
  DELETE_ITEM,
  DuplicateItemAction,
  DeleteItemAction
} from 'modules/scene/actions'
import { getGLTFId, getCurrentScene, getEntityComponentByType, getEntityComponents } from 'modules/scene/selectors'
import { ComponentType, SceneDefinition, ComponentDefinition } from 'modules/scene/types'
import { getSelectedEntityId } from 'modules/editor/selectors'
import { selectEntity, unselectEntity } from 'modules/editor/actions'
import { getProjectBounds } from 'modules/project/selectors'
import { getRandomPositionWithinBounds } from './utils'

export function* sceneSaga() {
  yield takeLatest(ADD_ITEM, handleAddItem)
  yield takeLatest(UPDATE_TRANSFORM, handleUpdateTransfrom)
  yield takeLatest(RESET_ITEM, handleResetItem)
  yield takeLatest(DUPLICATE_ITEM, handleDuplicateItem)
  yield takeLatest(DELETE_ITEM, handleDeleteItem)
}

function* handleAddItem(action: AddItemAction) {
  const scene: SceneDefinition = yield select(getCurrentScene)
  if (!scene) return

  const { asset, position } = action.payload

  let gltfId = yield select(getGLTFId(asset.url))
  const transformId = uuidv4()

  const newComponents = { ...scene.components }

  if (!gltfId) {
    gltfId = uuidv4()
    newComponents[gltfId] = {
      id: gltfId,
      type: ComponentType.GLTFShape,
      data: {
        src: asset.url
      }
    }
  }

  const bounds = yield select(getProjectBounds)
  const defaultPosition = getRandomPositionWithinBounds(bounds)
  defaultPosition.y = 0

  newComponents[transformId] = {
    id: transformId,
    type: ComponentType.Transform,
    data: {
      position: position || defaultPosition,
      rotation: { x: 0, y: 0, z: 0, w: 1 }
    }
  }

  const newEntities = { ...scene.entities }
  const entityId = uuidv4()
  newEntities[entityId] = { id: entityId, components: [gltfId, transformId] }

  yield put(provisionScene(scene.id, newComponents, newEntities))
}

function* handleUpdateTransfrom(action: UpdateTransfromAction) {
  const scene: SceneDefinition = yield select(getCurrentScene)
  if (!scene) return

  const { componentId, data } = action.payload

  const newComponents: SceneDefinition['components'] = { ...scene.components }
  newComponents[componentId] = {
    ...newComponents[componentId],
    data
  }

  yield put(provisionScene(scene.id, newComponents, scene.entities))
}

function* handleResetItem(_: ResetItemAction) {
  const scene: SceneDefinition = yield select(getCurrentScene)
  if (!scene) return

  const selectedEntityId: string | null = yield select(getSelectedEntityId)
  if (!selectedEntityId) return

  const transform: ComponentDefinition<ComponentType.Transform> | null = yield select(
    getEntityComponentByType(selectedEntityId, ComponentType.Transform)
  )
  if (!transform) return

  const newComponents = {
    ...scene.components,
    [transform.id]: {
      ...transform,
      data: {
        ...transform.data,
        rotation: { x: 0, y: 0, z: 0, w: 1 }
      }
    }
  }

  yield put(provisionScene(scene.id, newComponents, scene.entities))
}

function* handleDuplicateItem(_: DuplicateItemAction) {
  const scene: SceneDefinition = yield select(getCurrentScene)
  if (!scene) return

  const selectedEntityId: string | null = yield select(getSelectedEntityId)
  if (!selectedEntityId) return

  const newComponents = { ...scene.components }

  const gltfShape: ComponentDefinition<ComponentType.Transform> | null = yield select(
    getEntityComponentByType(selectedEntityId, ComponentType.GLTFShape)
  )
  const transform: ComponentDefinition<ComponentType.Transform> | null = yield select(
    getEntityComponentByType(selectedEntityId, ComponentType.Transform)
  )

  if (!gltfShape || !transform) return

  const transformId = uuidv4()
  newComponents[transformId] = {
    id: transformId,
    type: ComponentType.Transform,
    data: {
      position: {
        x: transform.data.position.x + 1,
        y: transform.data.position.y,
        z: transform.data.position.z + 1
      },
      rotation: { x: 0, y: 0, z: 0, w: 1 }
    }
  }

  const newEntities = { ...scene.entities }
  const entityId = uuidv4()
  newEntities[entityId] = { id: entityId, components: [gltfShape.id, transformId] }

  yield put(selectEntity(entityId))
  yield put(provisionScene(scene.id, newComponents, newEntities))
}

function* handleDeleteItem(_: DeleteItemAction) {
  const scene: SceneDefinition = yield select(getCurrentScene)
  if (!scene) return

  const selectedEntityId: string | null = yield select(getSelectedEntityId)
  if (!selectedEntityId) return

  const entityComponents: Record<string, ComponentDefinition<ComponentType>> = yield select(getEntityComponents(selectedEntityId))
  const idsToDelete = Object.values(entityComponents)
    .filter(component => !!component)
    .map(component => component.id)

  const newComponents = { ...scene.components }
  const newEntities = { ...scene.entities }
  delete newEntities[selectedEntityId]

  for (const componentId of idsToDelete) {
    // check if commponentId is not used by other entities
    if (Object.values(newEntities).some(entity => entity.components.some(id => componentId === id))) {
      continue
    }
    delete newComponents[componentId]
  }

  yield put(unselectEntity())
  yield put(provisionScene(scene.id, newComponents, newEntities))
}
