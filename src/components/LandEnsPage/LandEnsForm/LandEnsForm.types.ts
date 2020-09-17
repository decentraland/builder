import { Land } from 'modules/land/types'

export type Props = {
  land: Land
  onSetNameResolver: (ens: string, land: Land) => void
}

export type State = {
  selectedSubdomain: string
  subdomainList: string[]
  loading: boolean
  done: boolean
  message: string
}
