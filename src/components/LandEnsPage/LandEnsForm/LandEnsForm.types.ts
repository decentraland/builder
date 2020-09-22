import { Land } from 'modules/land/types'

export type Props = {
  land: Land
  isLoading: boolean
  error: string | null
  onSetNameResolver: (ens: string, land: Land) => void
}

export type State = {
  selectedSubdomain: string
  subdomainList: string[]
  done: boolean
}
