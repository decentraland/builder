import { select, delay, put, call, takeLatest } from 'redux-saga/effects'
import { getCurrentProject } from 'modules/project/selectors'
import { dataURLtoBlob } from 'modules/editor/utils'
import { PARCEL_SIZE } from 'modules/project/utils'
import { Project } from 'modules/project/types'
import { EditorWindow } from 'components/Preview/Preview.types'
import { RECORD_MEDIA_REQUEST, recordMediaProgress, recordMediaSuccess } from './actions'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { Media } from './types'

const editorWindow = window as EditorWindow

const Rotation = {
  NORTH: Math.PI * 1.5,
  EAST: 0,
  SOUTH: Math.PI / 2,
  WEST: Math.PI
}

export function* mediaSaga() {
  yield takeLatest(RECORD_MEDIA_REQUEST, handleTakePictures)
}

export function* handleTakePictures() {
  const project: Project = yield select(getCurrentProject)
  const side = Math.max(project.layout.cols, project.layout.rows)
  const zoom = (side - 1) * 32
  const canvas: HTMLCanvasElement = yield call(() => editorWindow.editor.getDCLCanvas())
  const initialAngle = Math.PI / 1.5
  const shots: Omit<Media, 'thumbnail'> = {
    north: '',
    east: '',
    south: '',
    west: ''
  }

  let thumbnail

  // Prepare the canvas for recording
  canvas.classList.add('recording')
  yield call(() => editorWindow.editor.resize())
  editorWindow.editor.resetCameraZoom()
  yield delay(200) // big scenes need some extra time to reset the camera

  // Prepare the camera to fit the scene
  editorWindow.editor.setCameraZoomDelta(zoom)
  editorWindow.editor.setCameraRotation(0, Math.PI / 3)
  editorWindow.editor.setCameraPosition({ x: (project.layout.rows * PARCEL_SIZE) / 2, y: 2, z: (project.layout.cols * PARCEL_SIZE) / 2 })

  yield put(recordMediaProgress(0))
  thumbnail = yield takeEditorScreenshot(initialAngle)
  yield put(recordMediaProgress(20))
  shots.north = yield takeEditorScreenshot(Rotation.NORTH)
  yield put(recordMediaProgress(40))
  shots.east = yield takeEditorScreenshot(Rotation.EAST)
  yield put(recordMediaProgress(60))
  shots.south = yield takeEditorScreenshot(Rotation.SOUTH)
  yield put(recordMediaProgress(80))
  shots.west = yield takeEditorScreenshot(Rotation.WEST)
  yield put(recordMediaProgress(100))

  // Cleanup
  canvas.classList.remove('recording')
  yield call(() => editorWindow.editor.resize())

  yield put(recordMediaSuccess({ ...shots, thumbnail }))
}

function* takeEditorScreenshot(angle: number) {
  editorWindow.editor.setCameraRotation(angle, Math.PI / 3)
  const shot = yield call(() => editorWindow.editor.takeScreenshot())
  return dataURLtoBlob(shot)
}
