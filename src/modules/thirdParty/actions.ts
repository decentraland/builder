import { action } from 'typesafe-actions'
import { MerkleDistributorInfo } from '@dcl/content-hash-tree/dist/types'
import { ChainId } from '@dcl/schemas'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Collection } from 'modules/collection/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { Item } from 'modules/item/types'
import { Slot, ThirdParty } from './types'

// Fetch Third Party Records

export const FETCH_THIRD_PARTIES_REQUEST = '[Request] Fetch Third Parties'
export const FETCH_THIRD_PARTIES_SUCCESS = '[Success] Fetch Third Parties'
export const FETCH_THIRD_PARTIES_FAILURE = '[Failure] Fetch Third Parties'

export const fetchThirdPartiesRequest = (address?: string) => action(FETCH_THIRD_PARTIES_REQUEST, { address })
export const fetchThirdPartiesSuccess = (thirdParties: ThirdParty[]) => action(FETCH_THIRD_PARTIES_SUCCESS, { thirdParties })
export const fetchThirdPartiesFailure = (error: string) => action(FETCH_THIRD_PARTIES_FAILURE, { error })

export type FetchThirdPartiesRequestAction = ReturnType<typeof fetchThirdPartiesRequest>
export type FetchThirdPartiesSuccessAction = ReturnType<typeof fetchThirdPartiesSuccess>
export type FetchThirdPartiesFailureAction = ReturnType<typeof fetchThirdPartiesFailure>

// Fetch Third Party Available Slots

export const FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST = '[Request] Fetch Third Party Available Slots'
export const FETCH_THIRD_PARTY_AVAILABLE_SLOTS_SUCCESS = '[Success] Fetch Third Party Available Slots'
export const FETCH_THIRD_PARTY_AVAILABLE_SLOTS_FAILURE = '[Failure] Fetch Third Party Available Slots'

export const fetchThirdPartyAvailableSlotsRequest = (thirdPartyId: ThirdParty['id']) =>
  action(FETCH_THIRD_PARTY_AVAILABLE_SLOTS_REQUEST, { thirdPartyId })
export const fetchThirdPartyAvailableSlotsSuccess = (thirdPartyId: ThirdParty['id'], availableSlots: number) =>
  action(FETCH_THIRD_PARTY_AVAILABLE_SLOTS_SUCCESS, { thirdPartyId, availableSlots })
export const fetchThirdPartyAvailableSlotsFailure = (error: string) => action(FETCH_THIRD_PARTY_AVAILABLE_SLOTS_FAILURE, { error })

export type FetchThirdPartyAvailableSlotsRequestAction = ReturnType<typeof fetchThirdPartyAvailableSlotsRequest>
export type FetchThirdPartyAvailableSlotsSuccessAction = ReturnType<typeof fetchThirdPartyAvailableSlotsSuccess>
export type FetchThirdPartyAvailableSlotsFailureAction = ReturnType<typeof fetchThirdPartyAvailableSlotsFailure>

// Review a third party

export const REVIEW_THIRD_PARTY_REQUEST = '[Request] Review a third party'
export const REVIEW_THIRD_PARTY_SUCCESS = '[Success] Review a third party'
export const REVIEW_THIRD_PARTY_FAILURE = '[Failure] Review a third party'
export const REVIEW_THIRD_PARTY_TX_SUCCESS = '[Tx Success] Review a third party'

export const reviewThirdPartyRequest = (
  thirdPartyId: ThirdParty['id'],
  slots: Slot[],
  merkleTreeRoot: MerkleDistributorInfo['merkleRoot']
) => action(REVIEW_THIRD_PARTY_REQUEST, { thirdPartyId, slots, merkleTreeRoot })

export const reviewThirdPartyTxSuccess = (txHash: string, chainId: ChainId) =>
  action(REVIEW_THIRD_PARTY_TX_SUCCESS, {
    ...buildTransactionPayload(chainId, txHash)
  })

export const reviewThirdPartySuccess = () => action(REVIEW_THIRD_PARTY_SUCCESS)
export const reviewThirdPartyFailure = (error: string) => action(REVIEW_THIRD_PARTY_FAILURE, { error })

export type ReviewThirdPartyRequestAction = ReturnType<typeof reviewThirdPartyRequest>
export type ReviewThirdPartySuccessAction = ReturnType<typeof reviewThirdPartySuccess>
export type ReviewThirdPartyTxSuccessAction = ReturnType<typeof reviewThirdPartyTxSuccess>
export type ReviewThirdPartyFailureAction = ReturnType<typeof reviewThirdPartyFailure>

// Publish Third Party Item

export const PUBLISH_THIRD_PARTY_ITEMS_REQUEST = '[Request] Publish third party items'
export const PUBLISH_THIRD_PARTY_ITEMS_SUCCESS = '[Success] Publish third party items'
export const PUBLISH_THIRD_PARTY_ITEMS_FAILURE = '[Failure] Publish third party items'

export const publishThirdPartyItemsRequest = (thirdParty: ThirdParty, items: Item[]) =>
  action(PUBLISH_THIRD_PARTY_ITEMS_REQUEST, { thirdParty, items })
export const publishThirdPartyItemsSuccess = (
  thirdPartyId: ThirdParty['id'],
  collectionId: Collection['id'],
  items: Item[],
  itemCurations: ItemCuration[]
) =>
  action(PUBLISH_THIRD_PARTY_ITEMS_SUCCESS, {
    thirdPartyId,
    collectionId,
    items,
    itemCurations
  })
export const publishThirdPartyItemsFailure = (error: string) => action(PUBLISH_THIRD_PARTY_ITEMS_FAILURE, { error })

export type PublishThirdPartyItemsRequestAction = ReturnType<typeof publishThirdPartyItemsRequest>
export type PublishThirdPartyItemsSuccessAction = ReturnType<typeof publishThirdPartyItemsSuccess>
export type PublishThirdPartyItemsFailureAction = ReturnType<typeof publishThirdPartyItemsFailure>

// Push changes Third Party Item

export const PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST = '[Request] Push third party items changes'
export const PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS = '[Success] Push third party items changes'
export const PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE = '[Failure] Push third party items changes'

export const pushChangesThirdPartyItemsRequest = (items: Item[]) => action(PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST, { items })
export const pushChangesThirdPartyItemsSuccess = (collectionId: Collection['id'], itemCurations: ItemCuration[]) =>
  action(PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS, {
    collectionId,
    itemCurations
  })
export const pushChangesThirdPartyItemsFailure = (error: string) => action(PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE, { error })

export type PushChangesThirdPartyItemsRequestAction = ReturnType<typeof pushChangesThirdPartyItemsRequest>
export type PushChangesThirdPartyItemsSuccessAction = ReturnType<typeof pushChangesThirdPartyItemsSuccess>
export type PushChangesThirdPartyItemsFailureAction = ReturnType<typeof pushChangesThirdPartyItemsFailure>

// Publish & Push changes Third Party Item

export const PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST = '[Request] Publish & Push third party items changes'
export const PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS = '[Success] Publish & Push third party items changes'
export const PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE = '[Failure] Publish & Push third party items changes'

export const publishAndPushChangesThirdPartyItemsRequest = (thirdParty: ThirdParty, itemsToPublish: Item[], itemsWithChanges: Item[]) =>
  action(PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST, { thirdParty, itemsToPublish, itemsWithChanges })

export const publishAndPushChangesThirdPartyItemsSuccess = (collectionId: Collection['id'], items: Item[], itemCurations: ItemCuration[]) =>
  action(PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS, { collectionId, items, itemCurations })

export const publishAndPushChangesThirdPartyItemsFailure = (error: string) =>
  action(PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE, { error })

export type PublishAndPushChangesThirdPartyItemsRequestAction = ReturnType<typeof publishAndPushChangesThirdPartyItemsRequest>
export type PublishAndPushChangesThirdPartyItemsSuccessAction = ReturnType<typeof publishAndPushChangesThirdPartyItemsSuccess>
export type PublishAndPushChangesThirdPartyItemsFailureAction = ReturnType<typeof publishAndPushChangesThirdPartyItemsFailure>

// Deploy batched third party items

export const DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST = '[Request] Deploy batched third party items'
export const DEPLOY_BATCHED_THIRD_PARTY_ITEMS_SUCCESS = '[Success] Deploy batched third party items'
export const DEPLOY_BATCHED_THIRD_PARTY_ITEMS_FAILURE = '[Failure] Deploy batched third party items'

export const deployBatchedThirdPartyItemsRequest = (
  items: Item[],
  collection: Collection,
  tree: MerkleDistributorInfo,
  hashes: Record<string, string>
) => action(DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST, { items, collection, tree, hashes })

export const deployBatchedThirdPartyItemsSuccess = (collection: Collection, itemCurations: ItemCuration[]) =>
  action(DEPLOY_BATCHED_THIRD_PARTY_ITEMS_SUCCESS, {
    collection,
    itemCurations
  })
export const deployBatchedThirdPartyItemsFailure = (items: Item[], error: string) =>
  action(DEPLOY_BATCHED_THIRD_PARTY_ITEMS_FAILURE, { items, error })

export type DeployBatchedThirdPartyItemsRequestAction = ReturnType<typeof deployBatchedThirdPartyItemsRequest>
export type DeployBatchedThirdPartyItemsSuccessAction = ReturnType<typeof deployBatchedThirdPartyItemsSuccess>
export type DeployBatchedThirdPartyItemsFailureAction = ReturnType<typeof deployBatchedThirdPartyItemsFailure>
