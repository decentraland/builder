import { Land } from 'modules/land/types'
import { ENSState } from 'modules/ens/reducer'

export type Props = {
  land: Land
  isLoading: boolean
  ens: ENSState
  selectedName: string
  error: string | null
  onSetENSResolver: (ens: string, land: Land) => void
  onSetENSContent: (ens: string, land: Land) => void
  onRestartForm: () => void
}

export type State = {
  isSetContentDone: boolean
  isSetResolverDone: boolean
  isSetContentDisabled: boolean
  isSetResolverDisabled: boolean
}
