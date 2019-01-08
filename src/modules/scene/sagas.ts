import * as uuid from 'uuid'
import { takeLatest, put, all, select } from 'redux-saga/effects'
import { ADD_ASSET, AddAssetAction, addReferences } from 'modules/scene/actions'
import { getGLTFId } from 'modules/component/selectors'
import { addComponent } from 'modules/component/actions'
import { ComponentType } from 'modules/component/types'
import { addEntity } from 'modules/entity/actions'
import { getProjectId } from 'modules/location/selectors';

function* watchSpawnItem() {
  yield takeLatest(ADD_ASSET, handleSpawnItem)
}

function* handleSpawnItem(action: AddAssetAction) {
  const { asset, position } = action.payload
  const projectId = getProjectId()
  const project = 

  let gltfId = yield select(getGLTFId(asset.url))
  let transformId = uuid.v4()

  if (!gltfId) {
    const id = uuid.v4()

    yield put(
      addComponent({
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
    addComponent({
      id: transformId,
      type: ComponentType.Transform,
      data: {
        position,
        rotation: { x: 0, y: 0, z: 0 }
      }
    })
  )

  yield put(
    addEntity({
      id: uuid.v4(),
      components: [gltfId, transformId]
    })
  )
}

export default function* sceneSaga() {
  yield all([watchSpawnItem()])
}
