import { select, delay, put, call, takeLatest } from 'redux-saga/effects'
import { getCurrentProject } from 'modules/project/selectors'
import { setProgress } from 'modules/deployment/actions'
import { dataURLtoBlob } from 'modules/editor/utils'
import { PARCEL_SIZE } from 'modules/project/utils'
import { WebmEncoder } from 'modules/editor/webm'
import { Project } from 'modules/project/types'
import { EditorWindow } from 'components/Preview/Preview.types'
import { RECORD_MEDIA_REQUEST } from './actions'

const editorWindow = window as EditorWindow

const Rotation = {
  NORTH: Math.PI * 1.5,
  EAST: 0,
  SOUTH: Math.PI / 2,
  WEST: Math.PI
}

export function* mediaSaga() {
  yield takeLatest(RECORD_MEDIA_REQUEST, handleRecordVideo)
}

export function* handleRecordVideo() {
  const project: Project = yield select(getCurrentProject)
  const side = Math.max(project.layout.cols, project.layout.rows)
  const zoom = (side - 1) * 32
  const canvas: HTMLCanvasElement = yield call(() => editorWindow.editor.getDCLCanvas())
  const encoder = new WebmEncoder(15)
  const stepAngle = Math.PI / 32
  const initialAngle = Math.PI / 1.5
  const shots = {
    north: null,
    east: null,
    south: null,
    west: null
  }
  let currentStep = 0
  const totalSteps = (Math.PI * 2) / stepAngle

  let angle = initialAngle
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

  // Spin the camera and capture video frames
  while (angle < Math.PI * 2 + initialAngle) {
    yield call(() => editorWindow.editor.setCameraRotation(angle, Math.PI / 3))
    let screenshot = yield call(() => editorWindow.editor.takeScreenshot('image/webp'))

    if (!thumbnail) {
      thumbnail = yield takeEditorScreenshot(angle)
    }

    encoder.add(screenshot)
    angle += stepAngle

    // Compute and dispatch progress
    const progress = ((currentStep++ / totalSteps) * 100) | 0
    yield put(setProgress(progress))
  }

  const video = yield call(() => new Promise(resolve => encoder.compile(resolve)))

  shots.north = yield takeEditorScreenshot(Rotation.NORTH)
  shots.east = yield takeEditorScreenshot(Rotation.EAST)
  shots.south = yield takeEditorScreenshot(Rotation.SOUTH)
  shots.west = yield takeEditorScreenshot(Rotation.WEST)

  // Cleanup
  canvas.classList.remove('recording')
  yield call(() => editorWindow.editor.resize())

  return { video, thumbnail, ...shots }
}

function* takeEditorScreenshot(angle: number) {
  editorWindow.editor.setCameraRotation(angle, Math.PI / 3)
  const shot = yield call(() => editorWindow.editor.takeScreenshot())
  return dataURLtoBlob(shot)
}
