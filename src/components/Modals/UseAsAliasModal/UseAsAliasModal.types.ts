import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ENS } from 'modules/ens/types'

export type Props = ModalProps & {
  address?: string
  isLoading: boolean
  usedAsAlias: ENS[]
  metadata: {
    oldName: string
    name: string
  }
  onSubmit: (address: string, name: string) => void
}

export type State = {}

export type MapStateProps = Pick<Props, 'isLoading' | 'address' | 'usedAsAlias'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch
