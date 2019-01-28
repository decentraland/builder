import uuidv4 from 'uuid/v4'
import { takeLatest, put, select } from 'redux-saga/effects'
import { ADD_ASSET, AddAssetAction, provisionScene } from 'modules/scene/actions'
import { getGLTFId, getCurrentScene } from 'modules/scene/selectors'
import { ComponentType, AnyComponent, EntityDefinition } from 'modules/scene/types'

export function* sceneSaga() {
  yield takeLatest(ADD_ASSET, handleAddAsset)
}

function* handleAddAsset(action: AddAssetAction) {
  const { asset, position } = action.payload
  const scene = yield select(getCurrentScene)

  let gltfId = yield select(getGLTFId(asset.url))
  let transformId = uuidv4()
  const components: AnyComponent[] = []

  if (!gltfId) {
    const id = uuidv4()
    components.push({
      id,
      type: ComponentType.GLTFShape,
      data: {
        src: asset.url
      }
    })

    gltfId = id
  }

  components.push({
    id: transformId,
    type: ComponentType.Transform,
    data: {
      position,
      rotation: { x: 0, y: 0, z: 0, w: 1 }
    }
  })

  const entities: EntityDefinition[] = [{ id: uuidv4(), components: [gltfId, transformId] }]

  yield put(provisionScene(scene.id, components, entities))
}
