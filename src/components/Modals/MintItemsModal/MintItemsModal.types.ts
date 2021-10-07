import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { mintCollectionItemsRequest, MintCollectionItemsRequestAction } from 'modules/collection/actions'
import { Collection, Mint } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = ModalProps & {
  ethAddress?: string
  metadata: CreateItemModalMetadata
  collection: Collection
  items: Item[]
  totalCollectionItems: number
  isLoading: boolean
  hasUnsyncedItems: (items: Item[]) => boolean
  onMint: typeof mintCollectionItemsRequest
}

export type CreateItemModalMetadata = {
  collectionId?: string
  itemIds?: string[]
}

export type ItemMints = Record<string, Partial<Mint>[]> // itemId: Beneficiary[]

export type State = {
  items: Item[]
  itemMints: ItemMints
  error: string | null
}

export type MapStateProps = Pick<Props, 'ethAddress' | 'collection' | 'items' | 'totalCollectionItems' | 'isLoading' | 'hasUnsyncedItems'>
export type MapDispatchProps = Pick<Props, 'onMint'>
export type MapDispatch = Dispatch<MintCollectionItemsRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
