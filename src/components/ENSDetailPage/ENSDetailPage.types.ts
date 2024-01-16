import { Avatar } from '@dcl/schemas'
import { fetchENSRequest } from 'modules/ens/actions'
import { ENS } from 'modules/ens/types'
import { openModal } from 'modules/modal/actions'

export type Props = {
  name: string | null
  ens: ENS | null
  isLoading: boolean
  alias: string | null
  avatar: Avatar | null
  onOpenModal: typeof openModal
  onFetchENS: typeof fetchENSRequest
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'ens' | 'isLoading' | 'alias' | 'avatar' | 'name'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onNavigate' | 'onFetchENS'>
