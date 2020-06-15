import { action } from 'typesafe-actions'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Land } from './types'

export const FETCH_LANDS_REQUEST = '[Request] Fetch Lands'
export const FETCH_LANDS_SUCCESS = '[Success] Fetch Lands'
export const FETCH_LANDS_FAILURE = '[Failure] Fetch Lands'

export const fetchLandsRequest = (address: string) => action(FETCH_LANDS_REQUEST, { address })
export const fetchLandsSuccess = (address: string, lands: Land[]) => action(FETCH_LANDS_SUCCESS, { address, lands })
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
      landId: land.id,
      name: land.name,
      address
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
      landId: land.id,
      name,
      description
    })
  })
export const editLandFailure = (land: Land, name: string, description: string, error: string) =>
  action(EDIT_LAND_FAILURE, { land, name, description, error })

export type EditLandRequestAction = ReturnType<typeof editLandRequest>
export type EditLandSuccessAction = ReturnType<typeof editLandSuccess>
export type EditLandFailureAction = ReturnType<typeof editLandFailure>
