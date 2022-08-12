import { Item } from 'modules/item/types'

export type Props = {
  item: Item | null
  name: string
  open: boolean
  onSaveThumbnail: (thumbnail: string) => void
  onClose: () => void
}

export type State = {
  view: string
  file: File | null
  error: string
  isLoading: boolean
}
