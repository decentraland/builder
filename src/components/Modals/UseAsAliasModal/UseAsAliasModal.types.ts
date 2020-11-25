import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ENS } from 'modules/ens/types'
import { setAliasRequest } from 'modules/ens/actions'

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

export type State = {}

export type MapStateProps = Pick<Props, 'isLoading' | 'address' | 'aliases' | 'name'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch
