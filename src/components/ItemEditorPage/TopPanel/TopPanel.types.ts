import { ChainId } from '@dcl/schemas'
import { RouteComponentProps } from 'react-router-dom'
import { initiateApprovalFlow, initiateTPApprovalFlow, deployMissingEntitiesRequest } from 'modules/collection/actions'
import { Item } from 'modules/item/types'
import { setCollectionCurationAssigneeRequest } from 'modules/curations/collectionCuration/actions'
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
  onInitiateApprovalFlow: ActionFunction<typeof initiateApprovalFlow>
  onInitiateTPApprovalFlow: ActionFunction<typeof initiateTPApprovalFlow>
  onSetAssignee: ActionFunction<typeof setCollectionCurationAssigneeRequest>
  onDeployMissingEntities: ActionFunction<typeof deployMissingEntitiesRequest>
} & Pick<RouteComponentProps, 'history'>

export type ContainerProps = Pick<Props, 'reviewedItems'>

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
