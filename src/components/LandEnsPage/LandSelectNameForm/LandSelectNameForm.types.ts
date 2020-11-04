import { Land } from 'modules/land/types'
import { ENS, ENSError } from 'modules/ens/types'

export type Props = {
  ensList: ENS[]
  land: Land
  isLoading: boolean
  error: ENSError | null
  onUpdateSubdomain: (selectedSubdomain: string) => void
  onFetchENS: (ens: string, land: Land) => void
}

export type State = {
  selectedSubdomain: string
}
