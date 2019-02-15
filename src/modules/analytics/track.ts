import { add } from 'decentraland-dapps/dist/modules/analytics/utils'
import { SUBMIT_PROJECT_SUCCESS, SubmitProjectSuccessAction } from 'modules/contest/actions'
import { ADD_ITEM, DROP_ITEM, RESET_ITEM, DUPLICATE_ITEM, DELETE_ITEM, SET_GROUND } from 'modules/scene/actions'
import {
  EDITOR_UNDO,
  EDITOR_REDO,
  TOGGLE_PREVIEW,
  TOGGLE_SIDEBAR,
  SET_GIZMO,
  ZOOM_IN,
  ZOOM_OUT,
  RESET_CAMERA
} from 'modules/editor/actions'
import { SEARCH_ASSETS } from 'modules/ui/sidebar/actions'
import { OPEN_MODAL } from 'modules/modal/actions'
import { CREATE_PROJECT, CreateProjectAction } from 'modules/project/actions'

function addPayload(actionType: string) {
  add(actionType, actionType, (action: any) => action.payload)
}

// contest actions
add(SUBMIT_PROJECT_SUCCESS, 'Contest data', action => {
  const payload = (action as SubmitProjectSuccessAction).payload
  return {
    projectId: payload.projectId,
    email: payload.contest.email,
    ethAddress: payload.contest.ethAddress
  }
})

// item actions
addPayload(ADD_ITEM)
addPayload(DROP_ITEM)
addPayload(RESET_ITEM)
addPayload(DUPLICATE_ITEM)
addPayload(DELETE_ITEM)

// editor actions
add(CREATE_PROJECT, CREATE_PROJECT, action => (action as CreateProjectAction).payload.project.parcelLayout)
addPayload(EDITOR_UNDO)
addPayload(EDITOR_REDO)
addPayload(TOGGLE_PREVIEW)
addPayload(TOGGLE_SIDEBAR)
addPayload(SEARCH_ASSETS)
addPayload(OPEN_MODAL)
addPayload(SET_GIZMO)
addPayload(SET_GROUND)

// camera actions
addPayload(ZOOM_IN)
addPayload(ZOOM_OUT)
addPayload(RESET_CAMERA)
