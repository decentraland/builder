import { add } from 'decentraland-dapps/dist/modules/analytics/utils'
import { DROP_ITEM, RESET_ITEM, DUPLICATE_ITEM, SET_GROUND, AddItemAction, DropItemAction, SetGroundAction } from 'modules/scene/actions'
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
import { SET_SIDEBAR_VIEW, SELECT_CATEGORY, SELECT_ASSET_PACK } from 'modules/ui/sidebar/actions'
import { OPEN_MODAL } from 'modules/modal/actions'
import {
  SET_PROJECT,
  ExportProjectRequestAction,
  EXPORT_PROJECT_REQUEST,
  IMPORT_PROJECT,
  SetProjectAction,
  CreateProjectAction,
  CREATE_PROJECT
} from 'modules/project/actions'

function addPayload(actionType: string, getPayload = (action: any) => action.payload) {
  add(actionType, actionType, getPayload)
}

export function trimAsset(action: AddItemAction | DropItemAction | SetGroundAction) {
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

function trimProject(action: CreateProjectAction | SetProjectAction | ExportProjectRequestAction) {
  if (!action.payload.project) {
    return action.payload
  }
  const { id, rows, cols } = action.payload.project
  return {
    projectId: id,
    rows,
    cols
  }
}

// item actions
addPayload(DROP_ITEM, trimAsset)
addPayload(RESET_ITEM)
addPayload(DUPLICATE_ITEM)

// editor actions
addPayload(CREATE_PROJECT, trimProject)
addPayload(SET_PROJECT, trimProject)
addPayload(EDITOR_UNDO)
addPayload(EDITOR_REDO)
addPayload(TOGGLE_PREVIEW)
addPayload(TOGGLE_SIDEBAR)
addPayload(SET_SIDEBAR_VIEW)
addPayload(SELECT_ASSET_PACK)
addPayload(SELECT_CATEGORY)
addPayload(OPEN_MODAL)
addPayload(SET_GIZMO)
addPayload(SET_GROUND, trimAsset)

// camera actions
addPayload(ZOOM_IN)
addPayload(ZOOM_OUT)
addPayload(RESET_CAMERA)

// import/export
addPayload(EXPORT_PROJECT_REQUEST, trimProject)
addPayload(IMPORT_PROJECT, () => ({}))
