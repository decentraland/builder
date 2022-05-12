import { ChainId } from '@dcl/schemas'
import { Collection } from 'modules/collection/types'
import { CurationStatus } from 'modules/curations/types'
import { Land } from 'modules/land/types'

export type Props = {
  size?: 'small' | 'medium' | 'big'
  land?: Land
  collection?: Collection
  chainId?: ChainId
  itemStatus?: CurationStatus
}
