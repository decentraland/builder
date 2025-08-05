import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'

export type Props = {
  item: Item | null
  collection: Collection | null
  isLoading: boolean
  isConnected: boolean
  id: string | null
  onFetchItem: (id: string) => void
  onFetchCollection: (id: string) => void
  children: (item: Item | null, collection: Collection | null, isLoading: boolean) => React.ReactNode
}
export type State = {
  loadedItemId: string | undefined
}

export type ContainerProps = Pick<Props, 'id' | 'children'>
