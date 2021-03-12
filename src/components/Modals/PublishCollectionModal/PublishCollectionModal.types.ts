import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { publishCollectionRequest, PublishCollectionRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = ModalProps & {
  metadata: PublishCollectionModalMetadata
  collection: Collection | null
  items: Item[]
  isLoading: boolean
  onPublish: typeof publishCollectionRequest
}

export type PublishCollectionModalMetadata = {
  collectionId: string
}

export type MapStateProps = Pick<Props, 'collection' | 'items' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onPublish'>
export type MapDispatch = Dispatch<PublishCollectionRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
