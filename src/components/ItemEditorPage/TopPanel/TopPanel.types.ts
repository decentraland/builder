import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { ChainId } from '@dcl/schemas'
import {
  initiateApprovalFlow,
  InitiateApprovalFlowAction,
  initiateTPApprovalFlow,
  InitiateTPApprovalFlowAction
} from 'modules/collection/actions'
import { Item } from 'modules/item/types'
import {
  setCollectionCurationAssigneeRequest,
  SetCollectionCurationAssigneeRequestAction
} from 'modules/curations/collectionCuration/actions'
import { RejectionType } from './RejectionModal/RejectionModal.types'
import { Collection } from 'modules/collection/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'

export type Props = {
  items: Item[]
  collection: Collection | null
  curation: CollectionCuration | null
  itemCurations: ItemCuration[] | null
  isLoading: boolean
  reviewedItems: Item[]
  totalItems: number | null
  address?: string
  chainId?: ChainId
  isConnected: boolean
  isReviewing: boolean
  isCommitteeMember: boolean
  selectedCollectionId: string | null
  onNavigate: (path: string) => void
  onInitiateApprovalFlow: typeof initiateApprovalFlow
  onInitiateTPApprovalFlow: typeof initiateTPApprovalFlow
  onSetAssignee: typeof setCollectionCurationAssigneeRequest
}

export type State = {
  currentVeredict?: boolean
  showRejectionModal: RejectionType | null
  showApproveConfirmModal: boolean
}

export enum ButtonType {
  APPROVE,
  REJECT,
  ENABLE,
  DISABLE
}

export type MapStateProps = Pick<
  Props,
  | 'items'
  | 'totalItems'
  | 'collection'
  | 'curation'
  | 'itemCurations'
  | 'isLoading'
  | 'address'
  | 'chainId'
  | 'isConnected'
  | 'isReviewing'
  | 'isCommitteeMember'
  | 'selectedCollectionId'
>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onInitiateApprovalFlow' | 'onInitiateTPApprovalFlow' | 'onSetAssignee'>
export type MapDispatch = Dispatch<
  CallHistoryMethodAction | InitiateApprovalFlowAction | InitiateTPApprovalFlowAction | SetCollectionCurationAssigneeRequestAction
>
