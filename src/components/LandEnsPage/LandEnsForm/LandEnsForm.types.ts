import { Land } from 'modules/land/types'

export type Props = {
  land: Land
  error: string | null
  onSetNameResolver: (ens: string, land: Land) => void
}

export type State = {
  selectedSubdomain: string
  subdomainList: string[]
  done: boolean
}
