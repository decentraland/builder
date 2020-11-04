import { Item } from 'modules/item/types'

export type Props = {
  label: string
  item: Item | null
  children: (item: Item) => React.ReactNode
}

export type State = {
  isCollapsed: boolean
}
