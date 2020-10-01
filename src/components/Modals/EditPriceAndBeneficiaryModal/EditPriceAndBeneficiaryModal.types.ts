import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Item } from 'modules/item/types'
import { saveItemRequest, SaveItemRequestAction, savePublishedItemRequest, SavePublishedItemRequestAction } from 'modules/item/actions'

export type Props = ModalProps & {
  item: Item | null
  isLoading: boolean
  metadata: EditPriceAndBeneficiaryModalMetadata
  onSave: typeof saveItemRequest
  onSavePublished: typeof savePublishedItemRequest
}

export type State = {
  price?: number
  beneficiary?: string
}

export type EditPriceAndBeneficiaryModalMetadata = {
  itemId: string
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'item' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSave' | 'onSavePublished'>
export type MapDispatch = Dispatch<SaveItemRequestAction | SavePublishedItemRequestAction>
