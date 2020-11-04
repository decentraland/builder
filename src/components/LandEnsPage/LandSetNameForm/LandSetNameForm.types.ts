import { Land } from 'modules/land/types'
import { ENS, ENSError } from 'modules/ens/types'

export type Props = {
  ens: ENS
  land: Land
  isLoading: boolean
  isWaitingTxSetContent: boolean
  isWaitingTxSetResolver: boolean
  selectedSubdomain: string
  error: ENSError | null
  onSetENSResolver: (ens: string) => void
  onSetENSContent: (ens: string, land: Land) => void
  onRestartForm: () => void
  onNavigate: (path: string) => void
}
