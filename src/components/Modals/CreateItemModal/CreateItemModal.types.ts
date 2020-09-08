import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ModelMetrics } from 'modules/scene/types'
import { saveItemRequest, SaveItemRequestAction } from 'modules/item/actions'
import { BodyShapeType, Item } from 'modules/item/types'

export enum CreateItemView {
  IMPORT = 'import',
  DETAILS = 'details'
}

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
  bodyShape?: BodyShapeType
  thumbnail?: string
  model?: string
  metrics?: ModelMetrics
  contents?: Record<string, Blob>
  isRepresentation?: boolean
  addRepresentationTo?: Item
  collectionId?: string
  isLoading?: boolean
  error?: string
}

export type CreateItemModalMetadata = {
  collectionId?: string
  addRepresentationTo?: Item
}

export type MapStateProps = Pick<Props, 'address' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch<SaveItemRequestAction>
