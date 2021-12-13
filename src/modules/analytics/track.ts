import { AnyAction } from 'redux'
import { add } from 'decentraland-dapps/dist/modules/analytics/utils'
import { getTransactionFromAction } from 'decentraland-dapps/dist/modules/transaction/utils'
import { GRANT_TOKEN_SUCCESS, REVOKE_TOKEN_SUCCESS } from 'decentraland-dapps/dist/modules/authorization/actions'
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
  EditEstateSuccessAction,
  EDIT_ESTATE_SUCCESS,
  DISSOLVE_ESTATE_SUCCESS,
  DissolveEstateSuccessAction,
  SET_UPDATE_MANAGER_SUCCESS,
  SetUpdateManagerSuccessAction
} from 'modules/land/actions'
import {
  DELETE_ITEM_FAILURE,
  DELETE_ITEM_SUCCESS,
  RESCUE_ITEMS_FAILURE,
  RESCUE_ITEMS_SUCCESS,
  RESET_ITEM_FAILURE,
  RESET_ITEM_SUCCESS,
  SaveItemFailureAction,
  SaveItemSuccessAction,
  SAVE_ITEM_FAILURE,
  SAVE_ITEM_SUCCESS,
  SET_PRICE_AND_BENEFICIARY_FAILURE,
  SET_PRICE_AND_BENEFICIARY_SUCCESS
} from 'modules/item/actions'
import {
  APPROVE_COLLECTION_FAILURE,
  APPROVE_COLLECTION_SUCCESS,
  DELETE_COLLECTION_FAILURE,
  DELETE_COLLECTION_SUCCESS,
  MINT_COLLECTION_ITEMS_FAILURE,
  MINT_COLLECTION_ITEMS_SUCCESS,
  PublishCollectionFailureAction,
  PublishCollectionSuccessAction,
  PUBLISH_COLLECTION_FAILURE,
  PUBLISH_COLLECTION_SUCCESS,
  REJECT_COLLECTION_FAILURE,
  REJECT_COLLECTION_SUCCESS,
  SAVE_COLLECTION_FAILURE,
  SAVE_COLLECTION_SUCCESS,
  SET_COLLECTION_MANAGERS_FAILURE,
  SET_COLLECTION_MANAGERS_SUCCESS,
  SET_COLLECTION_MINTERS_FAILURE,
  SET_COLLECTION_MINTERS_SUCCESS
} from 'modules/collection/actions'
import {
  ALLOW_CLAIM_MANA_SUCCESS,
  SET_ALIAS_SUCCESS,
  CLAIM_NAME_SUCCESS,
  SET_ENS_CONTENT_SUCCESS,
  SET_ENS_RESOLVER_SUCCESS,
  ClaimNameSuccessAction
} from 'modules/ens/actions'
import { CREATE_COLLECTION_FORUM_POST_FAILURE, CREATE_COLLECTION_FORUM_POST_SUCCESS } from 'modules/forum/actions'
import {
  APPROVE_CURATION_FAILURE,
  APPROVE_CURATION_SUCCESS,
  PUSH_CURATION_FAILURE,
  PUSH_CURATION_SUCCESS,
  REJECT_CURATION_FAILURE,
  REJECT_CURATION_SUCCESS
} from 'modules/curation/actions'
import { DEPLOY_ENTITIES_FAILURE, DEPLOY_ENTITIES_SUCCESS } from 'modules/entity/actions'
import {
  BUY_THIRD_PARTY_ITEM_TIERS_FAILURE,
  BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS,
  BuyThirdPartyItemTiersFailureAction,
  BuyThirdPartyItemTiersSuccessAction
} from 'modules/tiers/actions'

function addPayload(actionType: string, eventName: string, getPayload = (action: any) => action.payload) {
  add(actionType, eventName, getPayload)
}

export function trimAsset(action: AddItemAction | DropItemAction | SetGroundAction) {
  if (!action.payload.asset) {
    return action.payload
  }
  const asset = { ...action.payload.asset, contents: undefined } // contents generates tons of unnecessary columns on segment

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

// Authorizations
addPayload(GRANT_TOKEN_SUCCESS, 'Authorize')
addPayload(REVOKE_TOKEN_SUCCESS, 'Unauthorize')

// scene item actions
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
addPayload(CREATE_ESTATE_SUCCESS, 'Create estate')

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

// Item Editor
add(SAVE_ITEM_SUCCESS, 'Save item', action => {
  const { payload } = action as SaveItemSuccessAction
  return {
    item: payload.item
  }
})
add(SAVE_ITEM_FAILURE, 'Save item error', action => {
  const { payload } = action as SaveItemFailureAction
  return {
    item: payload.item,
    error: payload.error
  }
})

addPayload(DELETE_ITEM_SUCCESS, 'Delete item')
addPayload(DELETE_ITEM_FAILURE, 'Delete item error')

addPayload(SET_PRICE_AND_BENEFICIARY_SUCCESS, 'Set price and beneficiary')
addPayload(SET_PRICE_AND_BENEFICIARY_FAILURE, 'Set price and beneficiary failure')

addPayload(SAVE_COLLECTION_SUCCESS, 'Save collection')
addPayload(SAVE_COLLECTION_FAILURE, 'Save collection error')

addPayload(DELETE_COLLECTION_SUCCESS, 'Delete collection')
addPayload(DELETE_COLLECTION_FAILURE, 'Delete collection error')

add(PUBLISH_COLLECTION_SUCCESS, 'Publish collection', action => {
  const { payload } = action as PublishCollectionSuccessAction
  return {
    collection: payload.collection
  }
})
add(PUBLISH_COLLECTION_FAILURE, 'Publish collection error', action => {
  const { payload } = action as PublishCollectionFailureAction
  return {
    collection: payload.collection,
    error: payload.error
  }
})

add(BUY_THIRD_PARTY_ITEM_TIERS_SUCCESS, 'Buy third party item tiers success', action => {
  const { payload } = action as BuyThirdPartyItemTiersSuccessAction
  return {
    thirdPartyId: payload.thirdParty.id,
    tier: payload.tier
  }
})

add(BUY_THIRD_PARTY_ITEM_TIERS_FAILURE, 'Buy third party item tiers error', action => {
  const { payload } = action as BuyThirdPartyItemTiersFailureAction
  return {
    thirdPartyId: payload.thirdPartyId,
    tier: payload.tier,
    error: payload.error
  }
})

addPayload(MINT_COLLECTION_ITEMS_SUCCESS, 'Mint items')
addPayload(MINT_COLLECTION_ITEMS_FAILURE, 'Mint items error')

addPayload(SET_COLLECTION_MINTERS_SUCCESS, 'Set minters')
addPayload(SET_COLLECTION_MINTERS_FAILURE, 'Set minters error')

addPayload(SET_COLLECTION_MANAGERS_SUCCESS, 'Set collaborators')
addPayload(SET_COLLECTION_MANAGERS_FAILURE, 'Set collaborators error')

addPayload(APPROVE_COLLECTION_SUCCESS, 'Approve collection')
addPayload(APPROVE_COLLECTION_FAILURE, 'Approve collection error')

addPayload(REJECT_COLLECTION_SUCCESS, 'Reject collection')
addPayload(REJECT_COLLECTION_FAILURE, 'Reject collection error')

addPayload(CREATE_COLLECTION_FORUM_POST_SUCCESS, 'Create forum post')
addPayload(CREATE_COLLECTION_FORUM_POST_FAILURE, 'Create forum post error')

addPayload(PUSH_CURATION_SUCCESS, 'Push curation')
addPayload(PUSH_CURATION_FAILURE, 'Push curation error')

addPayload(RESCUE_ITEMS_SUCCESS, 'Rescue items')
addPayload(RESCUE_ITEMS_FAILURE, 'Rescue items error')

addPayload(DEPLOY_ENTITIES_SUCCESS, 'Deploy entities')
addPayload(DEPLOY_ENTITIES_FAILURE, 'Deploy entities failure')

addPayload(APPROVE_CURATION_SUCCESS, 'Approve curation')
addPayload(APPROVE_CURATION_FAILURE, 'Approve curation error')

addPayload(REJECT_CURATION_SUCCESS, 'Reject curation')
addPayload(REJECT_CURATION_FAILURE, 'Reject curation error')

addPayload(RESET_ITEM_SUCCESS, 'Reset changes')
addPayload(RESET_ITEM_FAILURE, 'Reset changes error')

// ENS analytics
add(SET_ENS_RESOLVER_SUCCESS, 'Set ENS Resolver', action => {
  const { payload } = getTransactionFromAction(action)
  const { ens, resolver, address } = payload
  return {
    address,
    ens,
    resolver
  }
})

add(SET_ENS_CONTENT_SUCCESS, 'Set ENS Content', action => {
  const { payload } = getTransactionFromAction(action)
  const { ens, content, land, address } = payload
  return {
    address,
    ens,
    content,
    land
  }
})

addPayload(SET_ALIAS_SUCCESS, 'Use as Alias')

addPayload(ALLOW_CLAIM_MANA_SUCCESS, 'Allow Claim Mana')

add(CLAIM_NAME_SUCCESS, 'Claim Name', action => {
  const { payload } = action as ClaimNameSuccessAction
  const { name, ens } = payload
  return {
    name,
    ens
  }
})
