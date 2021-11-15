import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { saveCollectionRequest, SaveCollectionRequestAction } from 'modules/collection/actions'
import { saveItemRequest, SaveItemRequestAction } from 'modules/item/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { URN } from 'lib/urn'

export type State = {
  newURNSection: string
}

export type Props = ModalProps & {
  collection: Collection | null
  item: Item | null
  isLoading: boolean
  metadata: EditURNModalMetadata
  onSaveCollection: typeof saveCollectionRequest
  onSaveItem: typeof saveItemRequest
}

export type EditURNModalMetadata = {
  id: string
  urn: URN
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'collection' | 'item' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSaveCollection' | 'onSaveItem'>
export type MapDispatch = Dispatch<SaveCollectionRequestAction | SaveItemRequestAction>
