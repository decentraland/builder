import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ModelMetrics } from 'modules/scene/types'
import { saveItemRequest, SaveItemRequestAction } from 'modules/item/actions'
import { Dispatch } from 'redux'

export enum CreateItemView {
  IMPORT = 'import',
  DETAILS = 'details'
}

export type BodyShapeOption = 'unisex' | 'male' | 'female'

export type Props = ModalProps & {
  address?: string
  metadata: CreateItemModalMetadata
  isLoading: boolean
  onSubmit: typeof saveItemRequest
}

export type State = {
  view: CreateItemView
  id?: string
  name?: string
  bodyShape?: BodyShapeOption
  thumbnail?: string
  model?: string
  metrics?: ModelMetrics
  contents?: Record<string, Blob>
  isLoading?: boolean
  error?: string
}

export type CreateItemModalMetadata = {
  collectionId?: string
}

export type MapStateProps = Pick<Props, 'address' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch<SaveItemRequestAction>
