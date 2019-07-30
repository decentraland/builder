import uuidv4 from 'uuid/v4'
import { takeLatest, put, select, call, delay } from 'redux-saga/effects'

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
import { getMappings } from 'modules/asset/utils'
import {
  getGLTFId,
  getCurrentScene,
  getEntityComponentByType,
  getEntityComponents,
  getScene,
  getCollectibleId,
  getEntityShape
} from 'modules/scene/selectors'
import { ComponentType, Scene, ComponentDefinition } from 'modules/scene/types'
import { getSelectedEntityId } from 'modules/editor/selectors'
import { selectEntity, deselectEntity } from 'modules/editor/actions'
import { getCurrentBounds, getProject } from 'modules/project/selectors'
import { LOAD_ASSET_PACKS_SUCCESS, LoadAssetPacksSuccessAction } from 'modules/assetPack/actions'
import { PARCEL_SIZE } from 'modules/project/utils'
import { EditorWindow } from 'components/Preview/Preview.types'
import { COLLECTIBLE_ASSET_PACK_ID } from 'modules/ui/sidebar/utils'
import { Project } from 'modules/project/types'
import { LOAD_PROJECT_SUCCESS, LoadProjectSuccessAction } from 'modules/project/actions'
import { snapToGrid, snapToBounds, cloneEntities, filterEntitiesWithComponent, isWithinBounds, areEqualMappings } from './utils'

const editorWindow = window as EditorWindow

export function* sceneSaga() {
  yield takeLatest(ADD_ITEM, handleAddItem)
  yield takeLatest(UPDATE_TRANSFORM, handleUpdateTransfrom)
  yield takeLatest(RESET_ITEM, handleResetItem)
  yield takeLatest(DUPLICATE_ITEM, handleDuplicateItem)
  yield takeLatest(DELETE_ITEM, handleDeleteItem)
  yield takeLatest(SET_GROUND, handleSetGround)
  yield takeLatest(FIX_CURRENT_SCENE, handleFixCurrentScene)
  yield takeLatest(LOAD_ASSET_PACKS_SUCCESS, handleLoadAssetPacks)
  yield takeLatest(LOAD_PROJECT_SUCCESS, handleLoadProjectSuccess)
}

function* handleLoadProjectSuccess(action: LoadProjectSuccessAction) {
  yield put(provisionScene(action.payload.manifest.scene))
}

function* handleAddItem(action: AddItemAction) {
  const scene: Scene = yield select(getCurrentScene)
  if (!scene) return

  let shapeId: string
  let { position } = action.payload
  const { asset } = action.payload
  const transformId = uuidv4()
  const newComponents = { ...scene.components }

  if (!position) {
    position = yield call(editorWindow.editor.getCameraTarget)
    position!.y = 0
  }

  if (asset.assetPackId === COLLECTIBLE_ASSET_PACK_ID) {
    shapeId = yield select(getCollectibleId(asset.url))

    if (!shapeId) {
      shapeId = uuidv4()
      newComponents[shapeId] = {
        id: shapeId,
        type: ComponentType.NFTShape,
        data: {
          url: asset.url
        }
      }
    }

    position = { ...position!, y: 1.72 }
  } else {
    shapeId = yield select(getGLTFId(asset.url))

    if (!shapeId) {
      shapeId = uuidv4()
      newComponents[shapeId] = {
        id: shapeId,
        type: ComponentType.GLTFShape,
        data: {
          src: asset.url,
          mappings: getMappings(asset)
        }
      }
    }
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

  const shape: ComponentDefinition<ComponentType.GLTFShape> | ComponentDefinition<ComponentType.NFTShape> | null = yield select(
    getEntityShape(selectedEntityId)
  )
  const transform: ComponentDefinition<ComponentType.Transform> | null = yield select(
    getEntityComponentByType(selectedEntityId, ComponentType.Transform)
  )

  if (shape && shape.type === ComponentType.NFTShape) return

  if (!shape || !transform) return

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
  newEntities[entityId] = { id: entityId, components: [shape.id, transformId] }

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
  const { asset, projectId } = action.payload
  const currentProject: Project | null = yield select(getProject(projectId))
  if (!currentProject) return

  const scene: Scene | null = yield select(getScene(currentProject.sceneId))
  if (!scene) return

  const { rows, cols } = currentProject
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
          src: asset.url,
          mappings: getMappings(asset)
        }
      }
    } else {
      gltfId = foundId
    }

    if (scene.ground) {
      entities = filterEntitiesWithComponent(scene.ground.componentId, entities)
    }

    for (let j = 0; j < cols; j++) {
      for (let i = 0; i < rows; i++) {
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

function* handleLoadAssetPacks(action: LoadAssetPacksSuccessAction) {
  // load current scene (if any)
  const scene: ReturnType<typeof getCurrentScene> = yield select(getCurrentScene)
  if (!scene) return

  // keep track of the updated components
  const updatedComponents: Record<string, ComponentDefinition<ComponentType.GLTFShape>> = {}

  // generate map of GLTFShape components by source
  const gltfShapes: Record<string, ComponentDefinition<ComponentType.GLTFShape>[]> = {}
  for (const component of Object.values(scene.components)) {
    if (component.type === ComponentType.GLTFShape) {
      const gltfShape = component as ComponentDefinition<ComponentType.GLTFShape>
      if (!gltfShapes[gltfShape.data.src]) {
        gltfShapes[gltfShape.data.src] = []
      }
      gltfShapes[gltfShape.data.src].push(gltfShape)
    }
  }

  // loop over each loaded asset and update the mappings of the components using it
  for (const assetPack of action.payload.assetPacks) {
    for (const asset of assetPack.assets) {
      if (asset.url in gltfShapes) {
        for (const component of gltfShapes[asset.url]) {
          const mappings = getMappings(asset)
          if (!areEqualMappings(component.data.mappings, mappings)) {
            updatedComponents[component.id] = {
              ...component,
              data: {
                ...component.data,
                mappings
              }
            }
          }
        }
      }
    }
  }

  // if there are any components that need to be updated, provision a new scene
  const hasUpdates = Object.keys(updatedComponents).length > 0
  if (hasUpdates) {
    const newScene = { ...scene, components: { ...scene.components, ...updatedComponents } }
    yield put(provisionScene(newScene))
  }
}
