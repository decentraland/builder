import { select, delay, put, call, takeLatest } from 'redux-saga/effects'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { getCurrentProject } from 'modules/project/selectors'
import { dataURLToBlob } from 'modules/media/utils'
import { PARCEL_SIZE } from 'modules/project/constants'
import { Project } from 'modules/project/types'
import { EditorWindow } from 'components/Preview/Preview.types'
import { RECORD_MEDIA_REQUEST, recordMediaProgress, recordMediaSuccess } from './actions'
import { RawMedia } from './types'
import { setSelectedEntities } from 'modules/editor/actions'

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

  let preview: Blob | null

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
  preview = yield takeEditorScreenshot(previewAngle)
  yield put(recordMediaProgress(100))

  // Cleanup
  canvas.classList.remove('recording')

  yield put(recordMediaSuccess({ ...screenshots, preview }))
}

function* takeEditorScreenshot(angle: number) {
  editorWindow.editor.setCameraRotation(angle, Math.PI / 6)
  const screenshot: string = yield call(() => editorWindow.editor.takeScreenshot())
  return dataURLToBlob(screenshot)
}
