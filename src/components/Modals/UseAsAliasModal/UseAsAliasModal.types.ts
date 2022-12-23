import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { setProfileAvatarAliasRequest } from 'decentraland-dapps/dist/modules/profile/actions'
import { ENS } from 'modules/ens/types'

export type Props = Omit<ModalProps, 'metadata'> & {
  address?: string
  isLoading: boolean
  aliases: ENS[]
  hasClaimedName: boolean
  name: string
  error: string | null
  metadata: {
    newName: string
  }
  onSubmit: typeof setProfileAvatarAliasRequest
}

export type MapStateProps = Pick<Props, 'isLoading' | 'address' | 'aliases' | 'hasClaimedName' | 'name' | 'error'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch
