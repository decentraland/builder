import { Land } from 'modules/land/types'
import { ENSState, ENSError } from 'modules/ens/reducer'

export type Props = {
  land: Land
  isLoading: boolean
  isWaitingTxSetContent: boolean
  isWaitingTxSetResolver: boolean
  ens: ENSState
  selectedName: string
  error: ENSError | null
  onSetENSResolver: (ens: string, land: Land) => void
  onSetENSContent: (ens: string, land: Land) => void
  onRestartForm: () => void
  onNavigate: (path: string) => void
}

export type State = {
  isSetContentDone: boolean
  isSetResolverDone: boolean
  isSetContentDisabled: boolean
  isSetResolverDisabled: boolean
}
