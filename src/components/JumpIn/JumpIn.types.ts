import { Collection } from 'modules/collection/types'
import { Land } from 'modules/land/types'

export type Props = {
  size?: 'small' | 'medium' | 'big'
  land?: Land
  collection?: Collection
}
