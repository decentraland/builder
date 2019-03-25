import { add } from 'decentraland-dapps/dist/modules/analytics/utils'
import { SUBMIT_PROJECT_FAILURE } from 'modules/contest/actions'
import {
  ADD_ITEM,
  DROP_ITEM,
  RESET_ITEM,
  DUPLICATE_ITEM,
  SET_GROUND,
  AddItemAction,
  DropItemAction,
  SetGroundAction
} from 'modules/scene/actions'
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
import { SEARCH_ASSETS, SET_SIDEBAR_VIEW, SELECT_CATEGORY } from 'modules/ui/sidebar/actions'
import { OPEN_MODAL } from 'modules/modal/actions'
import { CREATE_PROJECT, CreateProjectAction } from 'modules/project/actions'

function addPayload(actionType: string, getPayload = (action: any) => action.payload) {
  add(actionType, actionType, getPayload)
}

function trimAsset(action: AddItemAction | DropItemAction | SetGroundAction) {
  if (!action.payload.asset) {
    return action.payload
  }
  const asset = { ...action.payload.asset }
  delete asset.contents // this generates tons of unnecessary columns on segment

  return {
    ...action.payload,
    asset
  }
}

// contest actions
add(SUBMIT_PROJECT_FAILURE, 'Submit project failure')

// item actions
addPayload(ADD_ITEM, trimAsset)
addPayload(DROP_ITEM, trimAsset)
addPayload(RESET_ITEM)
addPayload(DUPLICATE_ITEM)

// editor actions
add(CREATE_PROJECT, CREATE_PROJECT, action => {
  const { id, layout } = (action as CreateProjectAction).payload.project
  return {
    projectId: id,
    ...layout
  }
})
addPayload(EDITOR_UNDO)
addPayload(EDITOR_REDO)
addPayload(TOGGLE_PREVIEW)
addPayload(TOGGLE_SIDEBAR)
addPayload(SET_SIDEBAR_VIEW)
addPayload(SELECT_CATEGORY)
addPayload(SEARCH_ASSETS)
addPayload(OPEN_MODAL)
addPayload(SET_GIZMO)
addPayload(SET_GROUND, trimAsset)

// camera actions
addPayload(ZOOM_IN)
addPayload(ZOOM_OUT)
addPayload(RESET_CAMERA)
