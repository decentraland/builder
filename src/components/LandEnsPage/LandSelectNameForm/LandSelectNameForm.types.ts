import { Land } from 'modules/land/types'
import { ENSState, ENSError } from 'modules/ens/reducer'

export type Props = {
  land: Land
  isLoading: boolean
  ens: ENSState
  subdomainList: string[]
  error: ENSError | null
  onUpdateName: (selectedName: string) => void
  onFetchENS: (ens: string, land: Land) => void
  onFetchDomainList: () => void
}

export type State = {
  selectedSubdomain: string
}
