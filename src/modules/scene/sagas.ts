import * as uuid from 'uuid'
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
  let transformId = uuid.v4()
  const components: AnyComponent[] = []

  if (!gltfId) {
    const id = uuid.v4()
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
      rotation: { x: 0, y: 0, z: 0 }
    }
  })

  const entities: EntityDefinition[] = [{ id: uuid.v4(), components: [gltfId, transformId] }]

  yield put(provisionScene(scene.id, components, entities))
}
