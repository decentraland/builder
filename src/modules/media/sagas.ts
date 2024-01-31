import { select, delay, put, call, takeLatest } from 'redux-saga/effects'
import { MessageTransport } from '@dcl/mini-rpc'
import { CameraClient } from '@dcl/inspector'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { getCurrentProject } from 'modules/project/selectors'
import { dataURLToBlob } from 'modules/media/utils'
import { PARCEL_SIZE } from 'modules/project/constants'
import { Layout, Project } from 'modules/project/types'
import { resizeScreenshot } from 'modules/editor/utils'
import { getCurrentScene } from 'modules/scene/selectors'
import { EditorWindow } from 'components/Preview/Preview.types'
import { setSelectedEntities } from 'modules/editor/actions'
import { Scene } from 'modules/scene/types'
import { RECORD_MEDIA_REQUEST, recordMediaProgress, recordMediaSuccess } from './actions'
import { RawMedia } from './types'

const editorWindow = window as EditorWindow

const Rotation = {
  NORTH: Math.PI / 2,
  EAST: 0,
  SOUTH: Math.PI * 1.5,
  WEST: Math.PI
}

export function* mediaSaga() {
  yield takeLatest(RECORD_MEDIA_REQUEST, handleTakePictures)
}

export function* handleTakePictures() {
  const project: Project | null = yield select(getCurrentProject)
  if (!project) return

  const scene: Scene | null = yield select(getCurrentScene)
  if (!scene) return

  if (scene.sdk6) {
    const { rows, cols } = project.layout

    yield put(setSelectedEntities([]))

    const side = Math.max(cols, rows)
    const zoom = (side - 1) * 32
    const canvas: HTMLCanvasElement = yield call(() => editorWindow.editor.getDCLCanvas())
    const previewAngle = Math.PI / 1.5
    const screenshots: Omit<RawMedia, 'preview'> = {
      north: null,
      east: null,
      south: null,
      west: null
    }

    // Prepare the canvas for recording
    canvas.classList.add('recording')
    editorWindow.editor.resetCameraZoom()
    yield delay(200) // big scenes need some extra time to reset the camera

    // Prepare the camera to fit the scene
    editorWindow.editor.setCameraZoomDelta(zoom)
    editorWindow.editor.setCameraRotation(0, Math.PI / 6)
    editorWindow.editor.setCameraPosition({ x: (rows * PARCEL_SIZE) / 2, y: 2, z: (cols * PARCEL_SIZE) / 2 })

    yield put(recordMediaProgress(0))
    screenshots.north = yield takeEditorScreenshot(Rotation.NORTH)
    yield put(recordMediaProgress(20))
    screenshots.east = yield takeEditorScreenshot(Rotation.EAST)
    yield put(recordMediaProgress(40))
    screenshots.south = yield takeEditorScreenshot(Rotation.SOUTH)
    yield put(recordMediaProgress(60))
    screenshots.west = yield takeEditorScreenshot(Rotation.WEST)
    yield put(recordMediaProgress(80))
    const preview: Blob | null = yield takeEditorScreenshot(previewAngle)
    yield put(recordMediaProgress(100))

    // Cleanup
    canvas.classList.remove('recording')

    yield put(recordMediaSuccess({ ...screenshots, preview }))
  } else {
    const iframe = document.getElementById('inspector') as HTMLIFrameElement | null
    if (!iframe || !iframe.contentWindow!) return
    const transport = new MessageTransport(window, iframe.contentWindow)
    const camera = new CameraClient(transport)
    yield call([camera, 'setPosition'], 0, 0, 0)
    const preview: Blob = yield call(takeInspectorScreenshot, camera, iframe, project.layout)
    yield put(
      recordMediaSuccess({
        // TODO: im leaving the rotations as empty because the sdk7 scenes do not support rotating the placement on the deplyoment modal yet
        north: new Blob(['']),
        east: new Blob(['']),
        south: new Blob(['']),
        west: new Blob(['']),
        preview
      })
    )
  }
}

function* takeEditorScreenshot(angle: number) {
  editorWindow.editor.setCameraRotation(angle, Math.PI / 6)
  const screenshot: string = yield call(() => editorWindow.editor.takeScreenshot())
  return dataURLToBlob(screenshot)
}

function* takeInspectorScreenshot(camera: CameraClient, iframe: HTMLIFrameElement, layout: Layout) {
  const { rows, cols } = layout
  const x = rows * 8
  const z = cols * 8
  const y = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2))

  yield call([camera, 'setPosition'], Math.min(-x, -16), Math.max(y, 24), Math.min(-z, -16))
  yield delay(100)
  yield call([camera, 'setTarget'], x / 2, Math.max(Math.sqrt(y), 4), z / 2)
  yield delay(100)

  const screenshot: string = yield call([camera, 'takeScreenshot'], +iframe.width, +iframe.height)
  const resized: string = yield call(resizeScreenshot, screenshot, 1024, 1024)

  return dataURLToBlob(resized)
}
