import { Land } from 'modules/land/types'
import {ENSState} from 'modules/ens/reducer';

export type Props = {
  land: Land
  isLoading: boolean
  ens: ENSState
  address: string | undefined
  error: string | null
  onSetENS: (ens: string, land: Land) => void
  onGetENS: (ens: string, land: Land) => void
}

export type State = {
  selectedSubdomain: string
  subdomainList: string[]
  done: boolean
}
