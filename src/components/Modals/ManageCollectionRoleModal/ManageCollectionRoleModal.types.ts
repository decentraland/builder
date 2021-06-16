import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import {
  setCollectionManagersRequest,
  setCollectionMintersRequest,
  SetCollectionMintersRequestAction,
  SetCollectionManagersRequestAction
} from 'modules/collection/actions'
import { Collection, RoleType } from 'modules/collection/types'

export type Props = Omit<ModalProps, 'metadata'> & {
  metadata: ManageCollectionRoleModalMetadata
  wallet: Wallet
  collection: Collection
  isLoading: boolean
  onSetManagers: typeof setCollectionManagersRequest
  onSetMinters: typeof setCollectionMintersRequest
}

export type State = {
  roles: (string | undefined)[]
}

export type ManageCollectionRoleModalMetadata = {
  collectionId?: string
  type: RoleType
  roles: string[]
}

export type MapStateProps = Pick<Props, 'wallet' | 'collection' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSetManagers' | 'onSetMinters'>
export type MapDispatch = Dispatch<SetCollectionManagersRequestAction | SetCollectionMintersRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
