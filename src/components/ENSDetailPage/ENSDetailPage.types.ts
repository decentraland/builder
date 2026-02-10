import { Avatar } from '@dcl/schemas'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet'
import { fetchENSRequest } from 'modules/ens/actions'
import { ENS } from 'modules/ens/types'

export type Props = {
  name: string | null
  ens: ENS | null
  isLoading: boolean
  alias: string | null
  avatar: Avatar | null
  wallet: Wallet | null
  error: string | null
  onOpenModal: ActionFunction<typeof openModal>
  onFetchENS: ActionFunction<typeof fetchENSRequest>
}
