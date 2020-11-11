import { Land } from 'modules/land/types'
import { ENS } from 'modules/ens/types'

export type Props = {
  ensList: ENS[]
  land: Land
  isLoading: boolean
  onUpdateSubdomain: (selectedSubdomain: string) => void
  onFetchENS: (ens: string, land: Land) => void
}

export type State = {
  selectedSubdomain: string
}
