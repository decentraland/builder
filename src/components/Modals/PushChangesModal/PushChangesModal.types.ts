import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

type ModalMetadata = {
  collectionId: string
  itemsWithChanges: Item[]
}

export type Props = OwnProps & {
  onPushChanges: (email: string, subscribeToNewsletter: boolean) => unknown
  isLoading: boolean
  error: string | null
  collection: Collection
}

export type OwnProps = Omit<ModalProps, 'metadata'> & { metadata: ModalMetadata }
