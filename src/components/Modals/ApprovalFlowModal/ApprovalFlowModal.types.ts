import { Dispatch } from 'redux'
import { DeploymentPreparationData } from 'dcl-catalyst-client'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { approveCollectionRequest, ApproveCollectionRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
import { rescueItemsRequest, RescueItemsRequestAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { deployEntitiesRequest, DeployEntitiesRequestAction } from 'modules/entity/actions'

export enum ApprovalFlowModalView {
  LOADING = 'loading',
  RESCUE = 'rescue',
  DEPLOY = 'deploy',
  APPROVE = 'approve',
  SUCCESS = 'success',
  ERROR = 'error'
}

export type ApprovalFlowModalMetadata<V extends ApprovalFlowModalView = ApprovalFlowModalView> = {
  view: V
  collection: Collection
} & (V extends ApprovalFlowModalView.RESCUE
  ? { items: Item[]; contentHashes: string[] }
  : V extends ApprovalFlowModalView.DEPLOY
  ? { items: Item[]; entities: DeploymentPreparationData[], didRescue: boolean }
  : V extends ApprovalFlowModalView.ERROR
  ? { error: string }
  : {})

export type Props = ModalProps & {
  onRescueItems: typeof rescueItemsRequest
  onDeployItems: typeof deployEntitiesRequest
  onApproveCollection: typeof approveCollectionRequest
  isConfirmingRescueTx: boolean
  isAwaitingRescueTx: boolean
  isDeployingItems: boolean
  isConfirmingApproveTx: boolean
  isAwaitingApproveTx: boolean
}

export type State = {
  isWaitingForSubgraph: boolean
}

export type MapStateProps = Pick<
  Props,
  'isAwaitingRescueTx' | 'isConfirmingRescueTx' | 'isDeployingItems' | 'isAwaitingApproveTx' | 'isConfirmingApproveTx'
>
export type MapDispatchProps = Pick<Props, 'onRescueItems' | 'onDeployItems' | 'onApproveCollection'>
export type MapDispatch = Dispatch<RescueItemsRequestAction | DeployEntitiesRequestAction | ApproveCollectionRequestAction>
