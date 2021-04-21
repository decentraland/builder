import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { setAliasRequest } from 'decentraland-dapps/dist/modules/ens/actions'
import { ENS } from 'modules/ens/types'

export type Props = ModalProps & {
  address?: string
  isLoading: boolean
  aliases: ENS[]
  name: string
  metadata: {
    newName: string
  }
  onSubmit: typeof setAliasRequest
}

export type MapStateProps = Pick<Props, 'isLoading' | 'address' | 'aliases' | 'name'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch
