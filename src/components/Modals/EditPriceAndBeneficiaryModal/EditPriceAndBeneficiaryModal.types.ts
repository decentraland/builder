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
  error: string | null
  isLoading: boolean
  metadata: EditPriceAndBeneficiaryModalMetadata
  itemSortedContents?: Record<string, Blob>
  mountNode?: HTMLDivElement | undefined
  onSave: typeof saveItemRequest
  onSetPriceAndBeneficiary: typeof setPriceAndBeneficiaryRequest
  onSkip?: () => void
}

export type State = {
  price?: string
  beneficiary?: string
  isFree: boolean
  isOwnerBeneficiary: boolean
}

export type EditPriceAndBeneficiaryModalMetadata = {
  itemId: string
}

export type OwnProps = Pick<Props, 'metadata' | 'item' | 'mountNode'>
export type MapStateProps = Pick<Props, 'item' | 'error' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSave' | 'onSetPriceAndBeneficiary'>
export type MapDispatch = Dispatch<SaveItemRequestAction | SetPriceAndBeneficiaryRequestAction>
