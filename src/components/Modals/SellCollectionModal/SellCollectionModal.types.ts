import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { setCollectionMintersRequest, SetCollectionMintersRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'

export type Props = ModalProps & {
  metadata: PublishCollectionModalMetadata
  collection: Collection
  isOnSale: boolean
  onSetMinters: typeof setCollectionMintersRequest
}

export type PublishCollectionModalMetadata = {
  collectionId: string
  isOnSale: boolean
}

export type MapStateProps = Pick<Props, 'collection'>
export type MapDispatchProps = Pick<Props, 'onSetMinters'>
export type MapDispatch = Dispatch<SetCollectionMintersRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
