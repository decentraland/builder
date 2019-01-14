import * as uuid from 'uuid'
import { takeLatest, put, select } from 'redux-saga/effects'
import { ADD_ASSET, AddAssetAction, addComponent, addEntity } from 'modules/scene/actions'
import { getGLTFId, getCurrentScene } from './selectors'
import { ComponentType } from './types'

export function* sceneSaga() {
  yield takeLatest(ADD_ASSET, handleAddAsset)
}

function* handleAddAsset(action: AddAssetAction) {
  const { asset, position } = action.payload
  const scene = yield select(getCurrentScene)

  let gltfId = yield select(getGLTFId(asset.url))
  let transformId = uuid.v4()

  if (!gltfId) {
    const id = uuid.v4()

    yield put(
      addComponent(scene.id, {
        id,
        type: ComponentType.GLTFShape,
        data: {
          src: asset.url
        }
      })
    )

    gltfId = id
  }

  yield put(
    addComponent(scene.id, {
      id: transformId,
      type: ComponentType.Transform,
      data: {
        position,
        rotation: { x: 0, y: 0, z: 0 }
      }
    })
  )

  yield put(
    addEntity(scene.id, {
      id: uuid.v4(),
      components: [gltfId, transformId]
    })
  )
}
