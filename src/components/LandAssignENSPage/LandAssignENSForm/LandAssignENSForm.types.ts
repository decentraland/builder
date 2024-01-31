import { Land } from 'modules/land/types'
import { ENS, ENSError } from 'modules/ens/types'

export type Props = {
  ens: ENS
  land: Land
  isLoading: boolean
  isWaitingTxSetContent: boolean
  isWaitingTxSetResolver: boolean
  isWaitingTxReclaim: boolean
  error: ENSError | null
  isEnsAddressEnabled: boolean
  onSetENSResolver: (ens: ENS) => void
  onSetENSContent: (ens: ENS, land: Land) => void
  onReclaimName: (ens: ENS) => void
  onBack: () => void
  onNavigate: (path: string) => void
}
