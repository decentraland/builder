import { Collection } from 'modules/collection/types'

export type Props = {
  collection: Collection
  itemCount: number
}

export type MapStateProps = Pick<Props, 'itemCount'>
export type OwnProps = Pick<Props, 'collection'>
