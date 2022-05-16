import { ChainId } from '@dcl/schemas'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { Land } from 'modules/land/types'

export type Props = {
  size?: 'small' | 'medium' | 'big'
  land?: Land
  collection?: Collection
  items?: Item[]
  chainId?: ChainId
}
