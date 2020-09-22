import { Item } from 'modules/item/types'

export type Props = {
  selectedItemId: string | null
  selectedCollectionId: string | null
  items: Item[]
  onNavigate: (path: string) => void
  hasHeader: boolean
}
