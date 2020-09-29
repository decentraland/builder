import { Land } from 'modules/land/types'
import { ENSState } from 'modules/ens/reducer'

export type Props = {
  land: Land
  isLoading: boolean
  ens: ENSState
  subdomainList: string[]
  error: string | null
  onSetENSResolver: (ens: string, land: Land) => void
  onSetENSContent: (ens: string, land: Land) => void
  onGetENS: (ens: string, land: Land) => void
  onGetDomainList: () => void
}

export type State = {
  selectedSubdomain: string
  isSetResolverDone: boolean
  isSetContentDone: boolean
}
