import uuidv4 from 'uuid/v4'
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
  SetGroundAction,
  FIX_CURRENT_SCENE
} from 'modules/scene/actions'
import { RootState } from 'modules/common/types'
import {
  getGLTFId,
  getCurrentScene,
  getEntityComponentByType,
  getEntityComponents,
  getScene,
  getCollectibleId
} from 'modules/scene/selectors'
import { ComponentType, Scene, ComponentDefinition } from 'modules/scene/types'
import { getSelectedEntityId } from 'modules/editor/selectors'
import { selectEntity, deselectEntity } from 'modules/editor/actions'
import { getCurrentBounds, getProject } from 'modules/project/selectors'
import { PARCEL_SIZE, isEqualLayout } from 'modules/project/utils'
import { EditorWindow } from 'components/Preview/Preview.types'
import { CategoryName } from 'modules/ui/sidebar/utils'
import { snapToGrid, snapToBounds, cloneEntities, filterEntitiesWithComponent, isWithinBounds } from './utils'

const editorWindow = window as EditorWindow

export function* sceneSaga() {
  yield takeLatest(ADD_ITEM, handleAddItem)
  yield takeLatest(UPDATE_TRANSFORM, handleUpdateTransfrom)
  yield takeLatest(RESET_ITEM, handleResetItem)
  yield takeLatest(DUPLICATE_ITEM, handleDuplicateItem)
  yield takeLatest(DELETE_ITEM, handleDeleteItem)
  yield takeLatest(SET_GROUND, handleSetGround)
  yield takeLatest(FIX_CURRENT_SCENE, handleFixCurrentScene)
}

function* handleAddItem(action: AddItemAction) {
  const scene: Scene = yield select(getCurrentScene)
  if (!scene) return

  let shapeId: string
  let { position } = action.payload
  const { asset } = action.payload
  const transformId = uuidv4()
  const newComponents = { ...scene.components }

  if (asset.category === CategoryName.COLLECTIBLE_CATEGORY) {
    shapeId = yield select(getCollectibleId(asset.url))

    if (!shapeId) {
      shapeId = uuidv4()
      newComponents[shapeId] = {
        id: shapeId,
        type: ComponentType.NFTShape,
        data: {
          url: `ethereum://CryptoKitties/${asset.id}`
        }
      }
    }
  } else {
    shapeId = yield select(getGLTFId(asset.url))

    if (!shapeId) {
      shapeId = uuidv4()
      newComponents[shapeId] = {
        id: shapeId,
        type: ComponentType.GLTFShape,
        data: {
          src: asset.url
        }
      }
    }
  }

  if (!position) {
    position = yield call(editorWindow.editor.getCameraTarget)
    position!.y = 0
  }

  const bounds: ReturnType<typeof getCurrentBounds> = yield select(getCurrentBounds)
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
  newEntities[entityId] = { id: entityId, components: [shapeId, transformId] }

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

  yield put(deselectEntity())
  yield put(provisionScene({ ...scene, components: newComponents, entities: newEntities }))
}

function* handleSetGround(action: SetGroundAction) {
  const { projectId, layout, asset } = action.payload

  const currentProject: ReturnType<typeof getProject> = yield select((state: RootState) => getProject(state, projectId))
  if (!currentProject) return

  const scene: ReturnType<typeof getScene> = yield select((state: RootState) => getScene(state, currentProject.sceneId))
  if (!scene) return

  const hasLayoutChanged = layout && !isEqualLayout(currentProject.layout, layout)
  const currentLayout = layout || currentProject.layout
  let components = { ...scene.components }
  let entities = cloneEntities(scene)
  let gltfId: string = uuidv4()

  // Skip if there are no updates
  if (asset && scene.ground && scene.ground.assetId === asset.id && !hasLayoutChanged) {
    return
  }

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

    if (scene.ground) {
      entities = filterEntitiesWithComponent(scene.ground.componentId, entities)
    }

    for (let j = 0; j < currentLayout.cols; j++) {
      for (let i = 0; i < currentLayout.rows; i++) {
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
    entities = filterEntitiesWithComponent(scene.ground.componentId, entities)
  }

  const ground = asset ? { assetId: asset.id, componentId: gltfId } : null

  // remove unused components
  for (const component of Object.values(components)) {
    if (!Object.values(entities).some(entity => entity.components.some(componentId => componentId === component.id))) {
      delete components[component.id]
    }
  }

  yield put(provisionScene({ ...scene, components, entities, ground }))
}

function* handleFixCurrentScene() {
  const scene: Scene = yield select(getCurrentScene)
  const bounds: ReturnType<typeof getCurrentBounds> = yield select(getCurrentBounds)

  if (!bounds || !scene) return

  const componentIdKeys = Object.keys(scene.components)
  let components = { ...scene.components }

  for (let key of componentIdKeys) {
    const component = scene.components[key] as ComponentDefinition<ComponentType.Transform>
    if (component.type === ComponentType.Transform) {
      if (!isWithinBounds(component.data.position, bounds)) {
        components[key] = {
          ...component,
          data: { ...component.data, position: snapToBounds(component.data.position, bounds) }
        }
      }
    }
  }

  yield put(provisionScene({ ...scene, components }))
}
