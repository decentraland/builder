import { Dispatch } from 'redux'
import { Item } from 'modules/item/types'
import { ExtCollection } from '../CurationPage.types'

export type Props = {
  collection: ExtCollection
  items: Item[]
}

export type MapStateProps = Pick<Props, 'items'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
export type OwnProps = Pick<Props, 'collection'>
