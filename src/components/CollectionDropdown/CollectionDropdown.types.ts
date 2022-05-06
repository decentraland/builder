import { Collection } from 'modules/collection/types'
import { Dispatch } from 'redux'

export type Props = {
  collections: Collection[]
  value?: Collection
  placeholder?: string
  filter?: (collection: Collection) => boolean
  onChange: (collection: Collection) => void
  isDisabled?: boolean
}

export type MapStateProps = Pick<Props, 'collections'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
export type OwnProps = Pick<Props, 'filter' | 'onChange'>
