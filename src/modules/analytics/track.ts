import { AnyAction } from 'redux'
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
import { SET_PROJECT, EXPORT_PROJECT_REQUEST, IMPORT_PROJECT, CREATE_PROJECT } from 'modules/project/actions'
import { SAVE_PROJECT_SUCCESS, SAVE_PROJECT_FAILURE } from 'modules/sync/actions'
import { OPEN_MODAL, CLOSE_MODAL } from 'modules/modal/actions'
import { SHARE_SCENE } from 'modules/ui/share/actions'
import { LIKE_POOL_REQUEST } from 'modules/pool/actions'
import { LOGIN_REQUEST, LOGOUT } from 'modules/identity/actions'
import {
  TRANSFER_LAND_SUCCESS,
  TransferLandSuccessAction,
  EDIT_LAND_SUCCESS,
  EditLandSuccessAction,
  SetOperatorSuccessAction,
  SET_OPERATOR_SUCCESS,
  CREATE_ESTATE_SUCCESS,
  CreateEstateSuccessAction,
  EditEstateSuccessAction,
  EDIT_ESTATE_SUCCESS,
  DISSOLVE_ESTATE_SUCCESS,
  DissolveEstateSuccessAction,
  SET_UPDATE_MANAGER_SUCCESS,
  SetUpdateManagerSuccessAction
} from 'modules/land/actions'

function addPayload(actionType: string, eventName: string, getPayload = (action: any) => action.payload) {
  add(actionType, eventName, getPayload)
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

function trimProject(action: AnyAction) {
  if (!action.payload.project) {
    return action.payload
  }
  const { id, layout } = action.payload.project
  const { rows, cols } = layout
  return {
    projectId: id,
    rows,
    cols
  }
}

// item actions
addPayload(DROP_ITEM, 'Drop item', trimAsset)
addPayload(RESET_ITEM, 'Reset item')
addPayload(DUPLICATE_ITEM, 'Duplicate item')

// editor actions
addPayload(CREATE_PROJECT, 'Create project', trimProject)
addPayload(SET_PROJECT, 'Set project', trimProject)
addPayload(EDITOR_UNDO, 'Editor undo')
addPayload(EDITOR_REDO, 'Editor redo')
addPayload(TOGGLE_PREVIEW, 'Toggle preview')
addPayload(TOGGLE_SIDEBAR, 'Toggle sidebar')
addPayload(SET_SIDEBAR_VIEW, 'Set sidebar view')
addPayload(SELECT_ASSET_PACK, 'Select asset pack')
addPayload(SELECT_CATEGORY, 'Select category')
addPayload(OPEN_MODAL, 'Open modal')
addPayload(CLOSE_MODAL, 'Close modal')
addPayload(SET_GIZMO, 'Set gizmo')
addPayload(SET_GROUND, 'Set ground', trimAsset)

// camera actions
addPayload(ZOOM_IN, 'Zoom in')
addPayload(ZOOM_OUT, 'Zoom out')
addPayload(RESET_CAMERA, 'Reset camera')

// import/export
// Do not change this event name format
addPayload(EXPORT_PROJECT_REQUEST, 'Export project', trimProject)
addPayload(IMPORT_PROJECT, 'Import project', () => ({}))

// sync
addPayload(SAVE_PROJECT_SUCCESS, 'Save project success', trimProject)
addPayload(SAVE_PROJECT_FAILURE, 'Save project failure', trimProject)

// auth
addPayload(LOGIN_REQUEST, 'Login')
addPayload(LOGOUT, 'Logout')

// Share
addPayload(SHARE_SCENE, 'Share scene')

// Like
addPayload(LIKE_POOL_REQUEST, 'Like pool')

// Transfer Land
add(TRANSFER_LAND_SUCCESS, 'Transfer land', action => {
  const { payload } = action as TransferLandSuccessAction
  return {
    id: payload.land.id,
    type: payload.land.type,
    name: payload.land.name,
    address: payload.address
  }
})

// Edit Land
add(EDIT_LAND_SUCCESS, 'Edit land', action => {
  const { payload } = action as EditLandSuccessAction
  return {
    id: payload.land.id,
    type: payload.land.type,
    name: payload.name,
    desciption: payload.description
  }
})

// Set Operator
add(
  SET_OPERATOR_SUCCESS,
  action => (action.payload.address ? 'Add operator' : 'Remove operator'),
  action => {
    const { payload } = action as SetOperatorSuccessAction
    return {
      id: payload.land.id,
      type: payload.land.type,
      address: payload.address
    }
  }
)

// Create Estate
add(CREATE_ESTATE_SUCCESS, 'Create estate', action => {
  const { payload } = action as CreateEstateSuccessAction
  return payload
})

// Edit Estate
add(
  EDIT_ESTATE_SUCCESS,
  action => (action.payload.type === 'add' ? 'Add parcels' : 'Remove parcels'),
  action => {
    const { payload } = action as EditEstateSuccessAction
    return {
      id: payload.land.id,
      type: payload.land.type,
      name: payload.land.name,
      coords: payload.coords
    }
  }
)

// Dissolve Estate
add(DISSOLVE_ESTATE_SUCCESS, 'Dissolve estate', action => {
  const { payload } = action as DissolveEstateSuccessAction
  return {
    id: payload.land.id,
    type: payload.land.type
  }
})

// Set Update Manager
add(
  SET_UPDATE_MANAGER_SUCCESS,
  action => (action.payload.isApproved ? 'Add manager' : 'Remove manager'),
  action => {
    const { payload } = action as SetUpdateManagerSuccessAction
    return {
      address: payload.address,
      type: payload.type
    }
  }
)
