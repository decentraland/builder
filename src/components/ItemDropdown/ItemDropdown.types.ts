import { Item } from 'modules/item/types'
import { Dispatch } from 'redux'

export type Props = {
  items: Item[]
  value?: Item
  placeholder?: string
  filter?: (item: Item) => boolean
  onChange: (item: Item) => void
  isDisabled?: boolean
}

export type MapStateProps = Pick<Props, 'items'>
export type MapDispatch = Dispatch
export type OwnProps = Pick<Props, 'filter' | 'onChange'>
