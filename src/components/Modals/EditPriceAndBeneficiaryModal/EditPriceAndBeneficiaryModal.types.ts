import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Item } from 'modules/item/types'
import {
  saveItemRequest,
  SaveItemRequestAction,
  setPriceAndBeneficiaryRequest,
  SetPriceAndBeneficiaryRequestAction
} from 'modules/item/actions'

export type Props = ModalProps & {
  item: Item
  isLoading: boolean
  metadata: EditPriceAndBeneficiaryModalMetadata
  onSave: typeof saveItemRequest
  onSetPriceAndBeneficiary: typeof setPriceAndBeneficiaryRequest
}

export type State = {
  price?: string
  beneficiary?: string
  isFree: boolean
}

export type EditPriceAndBeneficiaryModalMetadata = {
  itemId: string
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'item' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSave' | 'onSetPriceAndBeneficiary'>
export type MapDispatch = Dispatch<SaveItemRequestAction | SetPriceAndBeneficiaryRequestAction>
