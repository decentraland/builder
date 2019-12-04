import uuidv4 from 'uuid/v4'
import { takeLatest, put, select, call, delay, take } from 'redux-saga/effects'
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
  ApplyLayoutAction,
  APPLY_LAYOUT,
  SET_SCRIPT_VALUES,
  SetScriptValuesAction,
  SYNC_SCENE_ASSETS,
  SyncSceneAssetsAction,
  FIX_LEGACY_NAMESPACES,
  FixLegacyNamespacesAction,
  syncSceneAssets
} from 'modules/scene/actions'
import {
  getGLTFsBySrc,
  getCurrentScene,
  getEntityComponentsByType,
  getComponentsByEntityId,
  getData as getScenes,
  getCollectiblesByURL,
  getShapesByEntityId
} from 'modules/scene/selectors'
import { ComponentType, Scene, ComponentDefinition, ShapeComponent, AnyComponent } from 'modules/scene/types'
import { getSelectedEntityId, isReady } from 'modules/editor/selectors'
import { selectEntity, deselectEntity, SET_EDITOR_READY } from 'modules/editor/actions'
import { getCurrentBounds, getData as getProjects } from 'modules/project/selectors'
import { PARCEL_SIZE } from 'modules/project/utils'
import { EditorWindow } from 'components/Preview/Preview.types'
import { COLLECTIBLE_ASSET_PACK_ID } from 'modules/ui/sidebar/utils'
import {
  snapToGrid,
  snapToBounds,
  cloneEntities,
  filterEntitiesWithComponent,
  getSceneByProjectId,
  getEntityName,
  getDefaultValues,
  renameEntity,
  removeEntityReferences
} from './utils'
import { getData as getAssets, getGroundAssets, getAssetsByEntityName } from 'modules/asset/selectors'
import { Asset } from 'modules/asset/types'
import { loadAssets } from 'modules/asset/actions'
import { getProjectId } from 'modules/location/selectors'
import { getData as getAssetPacks } from 'modules/assetPack/selectors'
import { getMetrics } from 'components/AssetImporter/utils'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'

const editorWindow = window as EditorWindow

export function* sceneSaga() {
  yield takeLatest(ADD_ITEM, handleAddItem)
  yield takeLatest(UPDATE_TRANSFORM, handleUpdateTransfrom)
  yield takeLatest(RESET_ITEM, handleResetItem)
  yield takeLatest(DUPLICATE_ITEM, handleDuplicateItem)
  yield takeLatest(DELETE_ITEM, handleDeleteItem)
  yield takeLatest(SET_GROUND, handleSetGround)
  yield takeLatest(FIX_LEGACY_NAMESPACES, handleFixLegacyNamespaces)
  yield takeLatest(SYNC_SCENE_ASSETS, handleSyncSceneAssetsAction)
  yield takeLatest(APPLY_LAYOUT, handleApplyLayout)
  yield takeLatest(SET_SCRIPT_VALUES, handleSetScriptParameters)
}

function* handleAddItem(action: AddItemAction) {
  const isEditorReady: boolean = yield select(isReady)

  if (!isEditorReady) {
    yield take(SET_EDITOR_READY)
  }

  const scene: Scene = yield select(getCurrentScene)
  if (!scene) return

  let shapeId: string | null
  let scriptId: string | null = null
  let { position } = action.payload
  const { asset } = action.payload
  const transformId = uuidv4()
  const newComponents = { ...scene.components }

  if (!position) {
    position = yield call(editorWindow.editor.getCameraTarget)
    position!.y = 0
  }

  if (asset.assetPackId === COLLECTIBLE_ASSET_PACK_ID) {
    const collectibles: ReturnType<typeof getCollectiblesByURL> = yield select(getCollectiblesByURL)
    const collectible = collectibles[asset.model]
    shapeId = collectible ? collectibles[asset.model].id : null

    if (!shapeId) {
      shapeId = uuidv4()
      newComponents[shapeId] = {
        id: shapeId,
        type: ComponentType.NFTShape,
        data: {
          url: asset.model
        }
      }
    }

    position = { ...position!, y: 1.72 }
  } else {
    const gltfs: ReturnType<typeof getGLTFsBySrc> = yield select(getGLTFsBySrc)
    const gltf = gltfs[asset.model]
    shapeId = gltf ? gltfs[asset.model].id : null

    if (!shapeId) {
      shapeId = uuidv4()
      newComponents[shapeId] = {
        id: shapeId,
        type: ComponentType.GLTFShape,
        data: {
          assetId: asset.id,
          src: asset.model
        }
      } as ComponentDefinition<ComponentType.GLTFShape>
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
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 1, y: 1, z: 1 }
    }
  } as ComponentDefinition<ComponentType.Transform>

  const scriptPath = Object.keys(asset.contents).find(path => path.endsWith('.js'))
  if (scriptPath) {
    scriptId = uuidv4()

    newComponents[scriptId] = {
      id: scriptId,
      type: ComponentType.Script,
      data: {
        assetId: asset.id,
        src: asset.contents[scriptPath],
        values: {}
      }
    } as ComponentDefinition<ComponentType.Script>
  }

  const newEntities = { ...scene.entities }
  const entityId = uuidv4()
  const entityComponents = [transformId, shapeId]
  if (scriptId) {
    // Scripts components must go first
    entityComponents.unshift(scriptId)
  }
  const newScene = { ...scene, components: newComponents, entities: newEntities }
  // TODO: get entity name from asset name rather than GLTFShape
  const entityName = getEntityName(newScene, entityComponents)
  newEntities[entityId] = { id: entityId, components: entityComponents, name: entityName }
  newScene.assets[asset.id] = asset

  if (scriptId) {
    const assets: Record<string, Asset> = yield select(getAssetsByEntityName)
    const comp = newScene.components[scriptId] as ComponentDefinition<ComponentType.Script>
    comp.data.values = getDefaultValues(entityName, asset.parameters, assets)
  }

  yield put(provisionScene(newScene))
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
      data: {
        position: {
          ...data.position
        },
        rotation: {
          ...data.rotation
        },
        scale: {
          ...data.scale
        }
      }
    }

    yield put(provisionScene({ ...scene, components: newComponents }))
  }
}

function* handleResetItem(_: ResetItemAction) {
  const scene: Scene = yield select(getCurrentScene)
  if (!scene) return

  const selectedEntityId: string | null = yield select(getSelectedEntityId)
  if (!selectedEntityId) return

  const components: ReturnType<typeof getEntityComponentsByType> = yield select(getEntityComponentsByType)
  const transform = components[selectedEntityId][ComponentType.Transform] as ComponentDefinition<ComponentType.Transform>
  if (!transform) return

  const newComponents = {
    ...scene.components,
    [transform.id]: {
      ...transform,
      data: {
        ...transform.data,
        position: snapToGrid(transform.data.position),
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 }
      }
    }
  }

  yield put(provisionScene({ ...scene, components: newComponents }))
}

function* handleDuplicateItem(_: DuplicateItemAction) {
  const assets: DataByKey<Asset> = yield select(getAssets)
  const scene: Scene = yield select(getCurrentScene)
  if (!scene) return

  const selectedEntityId: string | null = yield select(getSelectedEntityId)
  if (!selectedEntityId) return

  const newComponents = { ...scene.components }
  const entityComponents = []

  const shapes: Record<string, ShapeComponent> = yield select(getShapesByEntityId)
  const shape = shapes[selectedEntityId]
  entityComponents.push(shape.id)

  if (shape && shape.type === ComponentType.NFTShape) return

  const components: ReturnType<typeof getEntityComponentsByType> = yield select(getEntityComponentsByType)
  const transform = components[selectedEntityId][ComponentType.Transform] as ComponentDefinition<ComponentType.Transform>
  const script = components[selectedEntityId][ComponentType.Script] as ComponentDefinition<ComponentType.Script>

  if (!shape || !transform) return

  // copy transform
  const {
    data: { position, rotation, scale }
  } = transform
  const transformId = uuidv4()
  newComponents[transformId] = {
    id: transformId,
    type: ComponentType.Transform,
    data: {
      position: { ...position },
      rotation: { ...rotation },
      scale: { ...scale }
    }
  }
  entityComponents.push(transformId)

  const newEntities = { ...scene.entities }
  const entityId = uuidv4()
  // WARNING: we use entityComponents here because we can already generate the name which will be used for the Script component.
  // This means that we use components before we are done creating all of them.
  const entityName = getEntityName(scene, entityComponents)

  newEntities[entityId] = { id: entityId, components: entityComponents, name: entityName }

  // copy script
  if (script) {
    const {
      data: { values: parameters, src, assetId }
    } = script
    const scriptId = uuidv4()
    const values = JSON.parse(JSON.stringify(parameters))

    renameEntity(assets[assetId].parameters, values, scene.entities[selectedEntityId].name, entityName)

    newComponents[scriptId] = {
      id: scriptId,
      type: ComponentType.Script,
      data: {
        values,
        src,
        assetId
      }
    } as ComponentDefinition<ComponentType.Script>

    // Scripts components must go first
    entityComponents.unshift(scriptId)
  }

  yield put(provisionScene({ ...scene, components: newComponents, entities: newEntities }))
  yield delay(200) // gotta wait for the webworker to process the updateEditor action
  yield put(selectEntity(entityId))
}

function* handleDeleteItem(_: DeleteItemAction) {
  const scene: Scene = yield select(getCurrentScene)
  if (!scene) return

  const selectedEntityId: string | null = yield select(getSelectedEntityId)
  if (!selectedEntityId) return

  const componentsByEntityId: Record<string, AnyComponent[]> = yield select(getComponentsByEntityId)
  const entityComponents = componentsByEntityId[selectedEntityId]
  const idsToDelete = entityComponents ? entityComponents.filter(component => !!component).map(component => component.id) : []

  const newComponents = { ...scene.components }
  const newEntities = { ...scene.entities }
  const newAssets = { ...scene.assets }
  delete newEntities[selectedEntityId]

  for (const componentId of idsToDelete) {
    // check if commponentId is not used by other entities
    if (Object.values(newEntities).some(entity => entity.components.some(id => componentId === id))) {
      continue
    }
    delete newComponents[componentId]
  }

  for (let componentId in newComponents) {
    const component = newComponents[componentId] as ComponentDefinition<ComponentType.Script>
    if (component.type === ComponentType.Script) {
      removeEntityReferences(newAssets[component.data.assetId].parameters, component.data.values, scene.entities[selectedEntityId].name)
    }
  }

  // TODO: refactor
  // gather all the models used by gltf shapes
  const models = Object.values(newComponents).reduce((set, component) => {
    if (component.type === ComponentType.GLTFShape) {
      const gltfShape = component as ComponentDefinition<ComponentType.GLTFShape>
      set.add(gltfShape.data.src)
    }
    return set
  }, new Set<string>())

  // remove assets that are not in the set
  for (const asset of Object.values(newAssets)) {
    if (models.has(asset.model)) {
      continue
    }
    delete newAssets[asset.id]
  }

  yield put(deselectEntity())
  yield put(provisionScene({ ...scene, components: newComponents, entities: newEntities, assets: newAssets }))
}

function* handleSetGround(action: SetGroundAction) {
  const { asset, projectId } = action.payload
  const projects: ReturnType<typeof getProjects> = yield select(getProjects)
  const currentProject = projects[projectId]
  if (!currentProject) return

  const scenes: ReturnType<typeof getScenes> = yield select(getScenes)
  const scene = scenes[currentProject.sceneId]
  if (!scene) return

  const { rows, cols } = currentProject.layout

  if (asset) {
    yield applyGround(scene, rows, cols, asset)
  }
}

function* handleFixLegacyNamespaces(_: FixLegacyNamespacesAction) {
  /*  The purspose of this saga is to fix old namespaces in gltshapes that used to be asset pack ids,
      and change them for the asset id instead.

      For gltf shapes that don't have a corresponding asset, a dummy one will be created
  */
  const newComponents: Record<string, ComponentDefinition<ComponentType.GLTFShape>> = {}
  const newAssets: Record<string, Asset> = {}

  // get current project id
  const projectId: string = yield select(getProjectId)
  if (!projectId) return

  // get current scene
  const scene: Scene | null = yield getSceneByProjectId(projectId)
  if (!scene) return

  // get asset packs
  const assetPacks: ReturnType<typeof getAssetPacks> = yield select(getAssetPacks)

  // get assets
  const assets: ReturnType<typeof getAssets> = yield select(getAssets)

  // gather all gltf shapes
  const gltfShapes = Object.values(scene.components).filter(component => component.type === ComponentType.GLTFShape) as ComponentDefinition<
    ComponentType.GLTFShape
  >[]
  for (const gltfShape of gltfShapes) {
    const { src } = gltfShape.data

    // if the src looks like <uuid>/<model-url> then it's legacy
    const legacyRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/ // check if the path starts with a UUID
    const isLegacy = legacyRegex.test(src.split('/')[0])
    if (isLegacy) {
      const [assetPackId, ...rest] = src.split('/')
      const model = rest.join('/')
      const assetPack = assetPacks[assetPackId]
      // if there's an asset pack, we look for the asset and fix the legacy componment
      if (assetPack) {
        const asset = assetPack.assets.map(assetId => assets[assetId]).find(asset => asset.model === model)
        if (asset) {
          const newGltfShape: ComponentDefinition<ComponentType.GLTFShape> = {
            ...gltfShape,
            data: { assetId: asset.id, src: asset.model }
          }
          newComponents[newGltfShape.id] = newGltfShape
          continue
        }
      }
      // if there's no asset pack but there are mappings, we generate a dummy asset from the mappings
      if ('mappings' in gltfShape.data) {
        const contents: Record<string, string> = {}
        const mappings = gltfShape.data['mappings'] as Record<string, string>
        for (const namespacedPath of Object.keys(mappings)) {
          const path = namespacedPath // remove the namespace
            .split('/') // ['<uuid>', 'folder', 'Model.gltf']
            .slice(1) // ['folder', 'Model.gltf']
            .join('/') // 'folder/Model.gltf'
          contents[path] = mappings[namespacedPath]
        }
        const id = uuidv4()
        const newAsset: Asset = {
          id,
          model,
          assetPackId,
          contents,
          name: 'Dummy',
          script: null,
          thumbnail: '',
          tags: [],
          category: 'decorations',
          metrics: getMetrics(),
          parameters: [],
          actions: []
        }
        newAssets[id] = newAsset

        const newGltfShape: ComponentDefinition<ComponentType.GLTFShape> = {
          ...gltfShape,
          data: {
            ...gltfShape.data!,
            assetId: newAsset.id,
            src: newAsset.model
          }
        }
        newComponents[newGltfShape.id] = newGltfShape
      } else {
        // noop
      }
    }
  }

  const hasUpdates = Object.keys(newComponents).length > 0
  if (hasUpdates) {
    const newScene = {
      ...scene,
      assets: { ...scene.assets, ...newAssets },
      components: { ...scene.components, ...newComponents }
    }
    yield put(syncSceneAssets(newScene))
  } else {
    yield put(syncSceneAssets(scene))
  }
}

function* handleSyncSceneAssetsAction(action: SyncSceneAssetsAction) {
  const { scene } = action.payload

  // assets that need to be updated in the scene
  const updatedSceneAssets: Record<string, Asset> = {}
  // assets that are present in the scene but not in the store
  const missingSceneAssets: Record<string, Asset> = {}
  // all assets in the store
  const assets: ReturnType<typeof getAssets> = yield select(getAssets)

  for (const component of Object.values(scene.components)) {
    if (component.type === ComponentType.GLTFShape) {
      const gltfShape = component as ComponentDefinition<ComponentType.GLTFShape>
      const { assetId } = gltfShape.data
      const storeAsset = assets[assetId]
      if (storeAsset) {
        updatedSceneAssets[storeAsset.id] = storeAsset
      } else {
        const sceneAsset = scene.assets[assetId]
        if (sceneAsset) {
          missingSceneAssets[sceneAsset.id] = {
            ...sceneAsset,
            assetPackId: 'dummy-asset-pack-id' // we change this so it won't show up in the sidebar
          }
        }
      }
    }
  }

  // generate new scene
  const newScene = { ...scene, assets: { ...scene.assets, ...updatedSceneAssets } }

  // load scene assets into redux store
  yield put(loadAssets(missingSceneAssets))

  // update the scene assets
  yield put(provisionScene(newScene))
}

function* handleApplyLayout(action: ApplyLayoutAction) {
  const { project } = action.payload
  const { rows, cols } = project.layout
  const scenes: ReturnType<typeof getScenes> = yield select(getScenes)
  const scene = scenes[project.sceneId]

  if (scene && scene.ground) {
    const groundId = scene.ground.assetId
    const assets: ReturnType<typeof getGroundAssets> = yield select(getGroundAssets)
    const ground = assets[groundId]
    yield applyGround(scene, rows, cols, ground)
  }
}

function* applyGround(scene: Scene, rows: number, cols: number, asset: Asset) {
  let components = { ...scene.components }
  let assets = { ...scene.assets }
  let entities = cloneEntities(scene)
  let gltfId: string = uuidv4()
  if (asset) {
    const gltfs: ReturnType<typeof getGLTFsBySrc> = yield select(getGLTFsBySrc)
    const gltf = gltfs[asset.model]
    const foundId = gltf ? gltfs[asset.model].id : null

    // Create the Shape component if necessary
    if (!foundId) {
      components[gltfId] = {
        id: gltfId,
        type: ComponentType.GLTFShape,
        data: {
          assetId: asset.id,
          src: asset.model
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
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            scale: { x: 1, y: 1, z: 1 }
          }
        }

        const newComponents = [gltfId, transformId]

        entities[entityId] = {
          id: entityId,
          components: newComponents,
          disableGizmos: true,
          name: getEntityName({ ...scene, entities }, newComponents)
        }
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

  // update assets removing the old ground and adding the new one
  if (scene.ground) {
    delete assets[scene.ground.assetId]
  }
  if (ground) {
    assets[ground.assetId] = asset
  }

  yield put(provisionScene({ ...scene, components, entities, ground, assets }))
}

function* handleSetScriptParameters(action: SetScriptValuesAction) {
  const { entityId, values } = action.payload
  const scene: Scene | null = yield select(getCurrentScene)

  if (scene) {
    const components = scene.entities[entityId].components
    const componentId = components.find(id => scene.components[id].type === ComponentType.Script)

    if (componentId) {
      const newScene: Scene = {
        ...scene,
        components: {
          ...scene.components,
          [componentId]: {
            ...scene.components[componentId],
            data: {
              ...scene.components[componentId].data,
              values: {
                ...(scene.components[componentId] as ComponentDefinition<ComponentType.Script>).data.values,
                ...values
              }
            }
          }
        }
      }
      yield put(provisionScene(newScene))
    }
  }
}
