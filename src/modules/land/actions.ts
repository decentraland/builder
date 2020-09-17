import { action } from 'typesafe-actions'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Land, LandType, Authorization } from './types'
import { Coord } from 'decentraland-ui'
import { getSelection } from './utils'

export const FETCH_LANDS_REQUEST = '[Request] Fetch Lands'
export const FETCH_LANDS_SUCCESS = '[Success] Fetch Lands'
export const FETCH_LANDS_FAILURE = '[Failure] Fetch Lands'

export const fetchLandsRequest = (address: string) => action(FETCH_LANDS_REQUEST, { address })
export const fetchLandsSuccess = (address: string, lands: Land[], authorizations: Authorization[]) =>
  action(FETCH_LANDS_SUCCESS, { address, lands, authorizations })
export const fetchLandsFailure = (address: string, error: string) => action(FETCH_LANDS_FAILURE, { address, error })

export type FetchLandsRequestAction = ReturnType<typeof fetchLandsRequest>
export type FetchLandsSuccessAction = ReturnType<typeof fetchLandsSuccess>
export type FetchLandsFailureAction = ReturnType<typeof fetchLandsFailure>

export const TRANSFER_LAND_REQUEST = '[Request] Transfer Land'
export const TRANSFER_LAND_SUCCESS = '[Success] Transfer Land'
export const TRANSFER_LAND_FAILURE = '[Failure] Transfer Land'

export const transferLandRequest = (land: Land, address: string) => action(TRANSFER_LAND_REQUEST, { land, address })
export const transferLandSuccess = (land: Land, address: string, txHash: string) =>
  action(TRANSFER_LAND_SUCCESS, {
    land,
    address,
    ...buildTransactionPayload(txHash, {
      id: land.id,
      name: land.name,
      address,
      selection: getSelection(land)
    })
  })
export const transferLandFailure = (land: Land, address: string, error: string) => action(TRANSFER_LAND_FAILURE, { land, address, error })

export type TransferLandRequestAction = ReturnType<typeof transferLandRequest>
export type TransferLandSuccessAction = ReturnType<typeof transferLandSuccess>
export type TransferLandFailureAction = ReturnType<typeof transferLandFailure>

export const EDIT_LAND_REQUEST = '[Request] Edit Land'
export const EDIT_LAND_SUCCESS = '[Success] Edit Land'
export const EDIT_LAND_FAILURE = '[Failure] Edit Land'

export const editLandRequest = (land: Land, name: string, description: string) => action(EDIT_LAND_REQUEST, { land, name, description })
export const editLandSuccess = (land: Land, name: string, description: string, txHash: string) =>
  action(EDIT_LAND_SUCCESS, {
    land,
    name,
    description,
    ...buildTransactionPayload(txHash, {
      id: land.id,
      name,
      description,
      selection: getSelection(land)
    })
  })
export const editLandFailure = (land: Land, name: string, description: string, error: string) =>
  action(EDIT_LAND_FAILURE, { land, name, description, error })

export type EditLandRequestAction = ReturnType<typeof editLandRequest>
export type EditLandSuccessAction = ReturnType<typeof editLandSuccess>
export type EditLandFailureAction = ReturnType<typeof editLandFailure>

export const SET_OPERATOR_REQUEST = '[Request] Set Operator'
export const SET_OPERATOR_SUCCESS = '[Success] Set Operator'
export const SET_OPERATOR_FAILURE = '[Failure] Set Operator'

export const setOperatorRequest = (land: Land, address: string | null) => action(SET_OPERATOR_REQUEST, { land, address })
export const setOperatorSuccess = (land: Land, address: string | null, txHash: string) =>
  action(SET_OPERATOR_SUCCESS, {
    land,
    address,
    ...buildTransactionPayload(txHash, {
      id: land.id,
      name: land.name,
      address,
      selection: getSelection(land)
    })
  })
export const setOperatorFailure = (land: Land, address: string | null, error: string) =>
  action(SET_OPERATOR_FAILURE, { land, address, error })

export type SetOperatorRequestAction = ReturnType<typeof setOperatorRequest>
export type SetOperatorSuccessAction = ReturnType<typeof setOperatorSuccess>
export type SetOperatorFailureAction = ReturnType<typeof setOperatorFailure>

export const CREATE_ESTATE_REQUEST = '[Request] Create Estate'
export const CREATE_ESTATE_SUCCESS = '[Success] Create Estate'
export const CREATE_ESTATE_FAILURE = '[Failure] Create Estate'

export const createEstateRequest = (name: string, description: string, coords: Coord[]) =>
  action(CREATE_ESTATE_REQUEST, { name, description, coords })
export const createEstateSuccess = (name: string, description: string, coords: Coord[], txHash: string) =>
  action(CREATE_ESTATE_SUCCESS, {
    name,
    description,
    coords,
    ...buildTransactionPayload(txHash, {
      name,
      description,
      size: coords.length,
      selection: coords
    })
  })
export const createEstateFailure = (name: string, description: string, coords: Coord[], error: string) =>
  action(CREATE_ESTATE_FAILURE, { name, description, coords, error })

export type CreateEstateRequestAction = ReturnType<typeof createEstateRequest>
export type CreateEstateSuccessAction = ReturnType<typeof createEstateSuccess>
export type CreateEstateFailureAction = ReturnType<typeof createEstateFailure>

export const EDIT_ESTATE_REQUEST = '[Request] Edit Estate'
export const EDIT_ESTATE_SUCCESS = '[Success] Edit Estate'
export const EDIT_ESTATE_FAILURE = '[Failure] Edit Estate'

export const editEstateRequest = (land: Land, toAdd: Coord[], toRemove: Coord[]) => action(EDIT_ESTATE_REQUEST, { land, toAdd, toRemove })
export const editEstateSuccess = (land: Land, coords: Coord[], type: 'add' | 'remove', txHash: string) =>
  action(EDIT_ESTATE_SUCCESS, {
    land,
    coords,
    type,
    ...buildTransactionPayload(txHash, {
      id: land.id,
      name: land.name,
      count: coords.length,
      type,
      selection: getSelection(land)
    })
  })
export const editEstateFailure = (land: Land, toAdd: Coord[], toRemove: Coord[], error: string) =>
  action(EDIT_ESTATE_FAILURE, { land, toAdd, toRemove, error })

export type EditEstateRequestAction = ReturnType<typeof editEstateRequest>
export type EditEstateSuccessAction = ReturnType<typeof editEstateSuccess>
export type EditEstateFailureAction = ReturnType<typeof editEstateFailure>

export const DISSOLVE_ESTATE_REQUEST = '[Request] Dissolve Estate'
export const DISSOLVE_ESTATE_SUCCESS = '[Success] Dissolve Estate'
export const DISSOLVE_ESTATE_FAILURE = '[Failure] Dissolve Estate'

export const dissolveEstateRequest = (land: Land) => action(DISSOLVE_ESTATE_REQUEST, { land })
export const dissolveEstateSuccess = (land: Land, txHash: string) =>
  action(DISSOLVE_ESTATE_SUCCESS, {
    land,
    ...buildTransactionPayload(txHash, {
      id: land.id,
      name: land.name,
      selection: getSelection(land)
    })
  })
export const dissolveEstateFailure = (land: Land, error: string) => action(DISSOLVE_ESTATE_FAILURE, { land, error })

export type DissolveEstateRequestAction = ReturnType<typeof dissolveEstateRequest>
export type DissolveEstateSuccessAction = ReturnType<typeof dissolveEstateSuccess>
export type DissolveEstateFailureAction = ReturnType<typeof dissolveEstateFailure>

export const SET_UPDATE_MANAGER_REQUEST = '[Request] Set Update Manager'
export const SET_UPDATE_MANAGER_SUCCESS = '[Success] Set Update Manager'
export const SET_UPDATE_MANAGER_FAILURE = '[Failure] Set Update Manager'

export const setUpdateManagerRequest = (address: string, type: LandType, isApproved: boolean) =>
  action(SET_UPDATE_MANAGER_REQUEST, { address, isApproved, type })
export const setUpdateManagerSuccess = (address: string, type: LandType, isApproved: boolean, txHash: string) =>
  action(SET_UPDATE_MANAGER_SUCCESS, {
    address,
    type,
    isApproved,
    ...buildTransactionPayload(txHash, {
      address,
      type,
      isApproved
    })
  })
export const setUpdateManagerFailure = (address: string, type: LandType, isApproved: boolean, error: string) =>
  action(SET_UPDATE_MANAGER_FAILURE, { address, type, isApproved, error })

export type SetUpdateManagerRequestAction = ReturnType<typeof setUpdateManagerRequest>
export type SetUpdateManagerSuccessAction = ReturnType<typeof setUpdateManagerSuccess>
export type SetUpdateManagerFailureAction = ReturnType<typeof setUpdateManagerFailure>



export const SET_NAME_RESOLVER_REQUEST = '[Request] Set Name Resolver'
export const SET_NAME_RESOLVER_SUCCESS = '[Success] Set Name Resolver'
export const SET_NAME_RESOLVER_FAILURE = '[Failure] Set Name Resolver'

export const setNameResolverRequest = (ens: string, land: Land) => 
  action(SET_NAME_RESOLVER_REQUEST, { ens, land })
export const setNameResolverSuccess = (ens: string, land: Land, txHash: string) =>
  action(SET_NAME_RESOLVER_SUCCESS, {
    ens,
    land,
    ...buildTransactionPayload(txHash, {
      id: land.id,
      name: land.name,
      selection: getSelection(land)
    })
  })
export const setNameResolverFailure = (ens: string, land: Land, error: string) =>
  action(SET_UPDATE_MANAGER_FAILURE, { ens, land, error })

export type SetNameResolverRequestAction = ReturnType<typeof setNameResolverRequest>
export type SetNameResolverSuccessAction = ReturnType<typeof setNameResolverSuccess>
export type SetNameResolverFailureAction = ReturnType<typeof setNameResolverFailure>
