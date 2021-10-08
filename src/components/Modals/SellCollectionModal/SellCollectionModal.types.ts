import { Dispatch } from 'redux'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { setCollectionMintersRequest, SetCollectionMintersRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'

export type Props = ModalProps & {
  metadata: PublishCollectionModalMetadata
  collection: Collection
  wallet: Wallet
  isLoading: boolean
  isOnSale: boolean
  hasUnsyncedItems: boolean
  onSetMinters: typeof setCollectionMintersRequest
}

export type PublishCollectionModalMetadata = {
  collectionId: string
  isOnSale: boolean
}

export type MapStateProps = Pick<Props, 'collection' | 'wallet' | 'isLoading' | 'hasUnsyncedItems'>
export type MapDispatchProps = Pick<Props, 'onSetMinters'>
export type MapDispatch = Dispatch<SetCollectionMintersRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
