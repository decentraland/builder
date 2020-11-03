import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { SaveCollectionRequestAction, saveCollectionRequest } from 'modules/collection/actions'

export enum CreateItemView {
  IMPORT = 'import',
  DETAILS = 'details'
}

export type Props = ModalProps & {
  address?: string
  isLoading: boolean
  onSubmit: typeof saveCollectionRequest
}

export type State = {
  collectionName: string
}

export type MapStateProps = Pick<Props, 'address' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch<SaveCollectionRequestAction>
