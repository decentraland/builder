import { Dispatch } from 'redux'
import { ChainId } from '@dcl/schemas'
import { RouteComponentProps } from 'react-router-dom'
import {
  initiateApprovalFlow,
  InitiateApprovalFlowAction,
  initiateTPApprovalFlow,
  InitiateTPApprovalFlowAction,
  deployMissingEntitiesRequest,
  DeployMissingEntitiesRequestAction
} from 'modules/collection/actions'
import { Item } from 'modules/item/types'
import {
  setCollectionCurationAssigneeRequest,
  SetCollectionCurationAssigneeRequestAction
} from 'modules/curations/collectionCuration/actions'
import { Collection } from 'modules/collection/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { ThirdParty } from 'modules/thirdParty/types'
import { RejectionType } from './RejectionModal/RejectionModal.types'

export type Props = {
  items: Item[]
  collection: Collection | null
  curation: CollectionCuration | null
  itemCurations: ItemCuration[] | null
  thirdParty: ThirdParty | null
  isLoading: boolean
  reviewedItems: Item[]
  totalItems: number | null
  address?: string
  chainId?: ChainId
  isConnected: boolean
  isReviewing: boolean
  isCommitteeMember: boolean
  hasCollectionMissingEntities: boolean
  selectedCollectionId: string | null
  onInitiateApprovalFlow: typeof initiateApprovalFlow
  onInitiateTPApprovalFlow: typeof initiateTPApprovalFlow
  onSetAssignee: typeof setCollectionCurationAssigneeRequest
  onDeployMissingEntities: typeof deployMissingEntitiesRequest
} & RouteComponentProps

export type State = {
  currentVeredict?: boolean
  showRejectionModal: RejectionType | null
  showApproveConfirmModal: boolean
}

export enum ButtonType {
  APPROVE,
  REJECT,
  ENABLE,
  DISABLE,
  DEPLOY_MISSING_ENTITIES
}

export type MapStateProps = Pick<
  Props,
  | 'items'
  | 'totalItems'
  | 'collection'
  | 'curation'
  | 'itemCurations'
  | 'thirdParty'
  | 'isLoading'
  | 'address'
  | 'chainId'
  | 'isConnected'
  | 'isReviewing'
  | 'isCommitteeMember'
  | 'selectedCollectionId'
  | 'hasCollectionMissingEntities'
>

export type MapDispatchProps = Pick<
  Props,
  'onInitiateApprovalFlow' | 'onInitiateTPApprovalFlow' | 'onSetAssignee' | 'onDeployMissingEntities'
>

export type MapDispatch = Dispatch<
  | InitiateApprovalFlowAction
  | InitiateTPApprovalFlowAction
  | SetCollectionCurationAssigneeRequestAction
  | DeployMissingEntitiesRequestAction
>
