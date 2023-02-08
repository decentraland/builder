import { ChainId } from '@dcl/schemas'
import { Dispatch } from 'redux'
import { OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { Land } from 'modules/land/types'

export type Props = {
  size?: 'small' | 'medium' | 'big'
  land?: Land
  collection?: Collection
  items?: Item[]
  chainId?: ChainId
  onJumpIn: () => void
}

export type MapDispatchProps = Pick<Props, 'onJumpIn'>
export type MapDispatch = Dispatch<OpenModalAction>
export type OwnProps = Pick<Props, 'size' | 'land' | 'collection' | 'items' | 'chainId'>
