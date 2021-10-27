import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { SaveCollectionRequestAction, saveCollectionRequest } from 'modules/collection/actions'
import { ThirdParty } from 'modules/thirdParty/types'

export type Props = ModalProps & {
  address?: string
  thirdParties: ThirdParty[]
  isLoading: boolean
  error: string | null
  onSubmit: typeof saveCollectionRequest
}

export type State = {
  thirdPartyId: string
  collectionName: string
  urnSuffix: string
  isTypedUrnSuffix: boolean
}

export type MapStateProps = Pick<Props, 'address' | 'thirdParties' | 'error' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch<SaveCollectionRequestAction>
