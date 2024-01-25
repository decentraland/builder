import { Land } from 'modules/land/types'

export type Props = {
  land: Land
  isEnsAddressEnabled: boolean
  onSetOperator: (land: Land, address: string | null) => void
}

export type State = {
  address: string
  initial: string
  loading: boolean
  revoked: boolean
  dirty: boolean
  editing: boolean
}
