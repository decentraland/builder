import { Land } from 'modules/land/types'

export type Props = {
  land: Land
  onSetOperator: (land: Land, address: string | null) => void
}

export type State = {
  selectedSubdomain: string
  subdomainList: string[]
  loading: boolean
  done: boolean
  message: string
}
