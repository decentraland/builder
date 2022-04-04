import { Item } from 'modules/item/types'

export type Props = {
  collectionId: string
  items: Item[]
  itemCount: number | null
  isLoading: boolean
}

export type MapStateProps = Pick<Props, 'items' | 'itemCount' | 'isLoading'>
export type OwnProps = Pick<Props, 'collectionId'>
