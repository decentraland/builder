import { saveItemRequest } from 'modules/item/actions'
import { Item } from 'modules/item/types'

export type Props = {
  title: string
  item: Item
  isLoading: boolean
  onSave: typeof saveItemRequest
  onSkip: () => void
  onClose: () => void
}

export type State = {
  price?: string
  beneficiary?: string
  isFree: boolean
}
