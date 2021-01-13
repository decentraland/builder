import { Land } from 'modules/land/types'
import { ENS } from 'modules/ens/types'
import { fetchENSRequest } from 'modules/ens/actions'

export type Props = {
  ensList: ENS[]
  land: Land
  isLoading: boolean
  onUpdateSubdomain: (selectedSubdomain: string) => void
  onFetchENS: typeof fetchENSRequest
}

export type State = {
  selectedName: string
}
