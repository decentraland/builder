import { Collection } from 'modules/collection/types'

export type Props = {
  collectionId: string
  className?: string
  collection?: Collection | null
  shape?: 'circle' | 'square'
}

export type MapStateProps = Pick<Props, 'collection'>
export type OwnProps = Pick<Props, 'collectionId' | 'className' | 'shape'>
