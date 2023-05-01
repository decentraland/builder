import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { deployToWorldRequest, DeployToWorldRequestAction } from 'modules/deployment/actions'
import { ENS } from 'modules/ens/types'
import { Project } from 'modules/project/types'

export type Props = {
  name: string
  project: Project | null
  ensList: ENS[]
  isLoading: boolean
  onClose: () => void
  onBack: () => void
  onPublish: typeof deployToWorldRequest
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'ensList' | 'project' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onPublish' | 'onNavigate'>
export type MapDispatch = Dispatch<DeployToWorldRequestAction | CallHistoryMethodAction>
