import uuidv4 from 'uuid/v4'
import { utils } from 'decentraland-commons'
import { delay } from 'redux-saga'
import { takeLatest, put, select, call } from 'redux-saga/effects'
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
  DeleteItemAction,
  SET_GROUND,
  SetGroundAction
} from 'modules/scene/actions'
import { getGLTFId, getCurrentScene, getEntityComponentByType, getEntityComponents, getData as getSceneData } from 'modules/scene/selectors'
import { ComponentType, Scene, ComponentDefinition } from 'modules/scene/types'
import { getSelectedEntityId } from 'modules/editor/selectors'
import { selectEntity, unselectEntity } from 'modules/editor/actions'
import { PARCEL_SIZE } from 'modules/project/utils'
import { EditorWindow } from 'components/Preview/Preview.types'
import { getProjectBounds } from 'modules/project/selectors'
import { cloneEntities, snapToGrid, snapToBounds } from './utils'

const editorWindow = window as EditorWindow

export function* sceneSaga() {
  yield takeLatest(ADD_ITEM, handleAddItem)
  yield takeLatest(UPDATE_TRANSFORM, handleUpdateTransfrom)
  yield takeLatest(RESET_ITEM, handleResetItem)
  yield takeLatest(DUPLICATE_ITEM, handleDuplicateItem)
  yield takeLatest(DELETE_ITEM, handleDeleteItem)
  yield takeLatest(SET_GROUND, handleSetGround)
}

function* handleAddItem(action: AddItemAction) {
  const scene: Scene = yield select(getCurrentScene)
  if (!scene) return

  let { position } = action.payload
  const { asset } = action.payload

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

  if (!position) {
    position = yield call(editorWindow.editor.getCameraTarget)
  }

  const bounds: ReturnType<typeof getProjectBounds> = yield select(getProjectBounds)
  if (bounds) {
    position = snapToBounds(position!, bounds)
  }

  position = snapToGrid(position!)

  newComponents[transformId] = {
    id: transformId,
    type: ComponentType.Transform,
    data: {
      position,
      rotation: { x: 0, y: 0, z: 0, w: 1 }
    }
  }

  const newEntities = { ...scene.entities }
  const entityId = uuidv4()
  newEntities[entityId] = { id: entityId, components: [gltfId, transformId] }

  yield put(provisionScene({ ...scene, components: newComponents, entities: newEntities }))
  yield delay(200) // gotta wait for the webworker to process the updateEditor action
  yield put(selectEntity(entityId))
}

function* handleUpdateTransfrom(action: UpdateTransfromAction) {
  const scene: Scene = yield select(getCurrentScene)
  if (!scene) return

  const { componentId, data } = action.payload

  if (componentId in scene.components) {
    const newComponents: Scene['components'] = { ...scene.components }
    newComponents[componentId] = {
      ...newComponents[componentId],
      data
    }

    yield put(provisionScene({ ...scene, components: newComponents }))
  }
}

function* handleResetItem(_: ResetItemAction) {
  const scene: Scene = yield select(getCurrentScene)
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
        position: snapToGrid(transform.data.position),
        rotation: { x: 0, y: 0, z: 0, w: 1 }
      }
    }
  }

  yield put(provisionScene({ ...scene, components: newComponents }))
}

function* handleDuplicateItem(_: DuplicateItemAction) {
  const scene: Scene = yield select(getCurrentScene)
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

  const {
    data: { position, rotation }
  } = transform

  const transformId = uuidv4()
  newComponents[transformId] = {
    id: transformId,
    type: ComponentType.Transform,
    data: {
      position: {
        x: position.x,
        y: position.y,
        z: position.z
      },
      rotation: { ...rotation }
    }
  }

  const newEntities = { ...scene.entities }
  const entityId = uuidv4()
  newEntities[entityId] = { id: entityId, components: [gltfShape.id, transformId] }

  yield put(provisionScene({ ...scene, components: newComponents, entities: newEntities }))
  yield delay(200) // gotta wait for the webworker to process the updateEditor action
  yield put(selectEntity(entityId))
}

function* handleDeleteItem(_: DeleteItemAction) {
  const scene: Scene = yield select(getCurrentScene)
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
  yield put(provisionScene({ ...scene, components: newComponents, entities: newEntities }))
}

function* handleSetGround(action: SetGroundAction) {
  const { sceneId, layout, asset } = action.payload

  const sceneData = yield select(getSceneData)
  const scene: Scene | undefined = sceneData[sceneId]

  if (!scene) return

  let components = { ...scene.components }
  let entities = cloneEntities(scene)
  let gltfId: string = uuidv4()

  if (asset) {
    // Create the Shape component if necessary
    const foundId = yield select(getGLTFId(asset.url))

    if (!foundId) {
      components[gltfId] = {
        id: gltfId,
        type: ComponentType.GLTFShape,
        data: {
          src: asset.url
        }
      }
    } else {
      gltfId = foundId
    }

    // if (scene.ground) {
    //   // Update the existing ground
    //   for (let id in entities) {
    //     const ent = entities[id]
    //     const index = ent.components.indexOf(scene.ground.componentId)
    //     if (index > -1) {
    //       // Remove the old ground and attach the new one
    //       components = utils.omit(components, [scene.ground.componentId])
    //       ent.components = Object.assign([], ent.components, { [index]: gltfId }) // replaces cloned array[index]'s value
    //     }
    //   }
    // }

    // TODO: If layout changed
    // Create the ground

    if (scene.ground) {
      for (let id in entities) {
        const ent = entities[id]
        const index = ent.components.indexOf(scene.ground.componentId)
        if (index > -1) {
          components = utils.omit(components, ent.components)
          ent.components = []
        }
      }
    }

    for (let j = 0; j < layout.cols; j++) {
      for (let i = 0; i < layout.rows; i++) {
        const entityId = uuidv4()
        const transformId = uuidv4()

        components[transformId] = {
          id: transformId,
          type: ComponentType.Transform,
          data: {
            position: { x: i * PARCEL_SIZE + PARCEL_SIZE / 2, y: 0, z: j * PARCEL_SIZE + PARCEL_SIZE / 2 },
            rotation: { x: 0, y: 0, z: 0, w: 1 }
          }
        }

        entities[entityId] = { id: entityId, components: [gltfId, transformId], disableGizmos: true }
      }
    }
  } else if (scene.ground) {
    // We need to clear the ground
    for (let id in entities) {
      const ent = entities[id]
      const index = ent.components.indexOf(scene.ground.componentId)

      if (index > -1) {
        // Remove entities which conform the floor
        delete entities[id]
      }
    }
  }

  const ground = asset ? { assetId: asset.id, componentId: gltfId } : null

  yield put(provisionScene({ ...scene, components, entities, ground }))
}
