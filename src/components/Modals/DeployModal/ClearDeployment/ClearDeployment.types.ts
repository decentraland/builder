import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'
import { ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { DeploymentStatus } from 'modules/deployment/types'
import { clearDeploymentRequest, ClearDeploymentRequestAction } from 'modules/deployment/actions'
import { DeploymentState } from 'modules/deployment/reducer'
import { Project } from 'modules/project/types'

export type Props = SignInProps & {
  isConnected: boolean
  isUploadingAssets: boolean
  isCreatingFiles: boolean
  deploymentProgress: DeploymentState['progress']
  ethAddress: string | undefined
  project: Project | null
  deploymentStatus: DeploymentStatus
  onClose: () => void
  onClearDeployment: typeof clearDeploymentRequest
}

export type State = {
  hasError: boolean
  needsConfirmation: boolean
}

export type MapStateProps = Pick<
  Props,
  | 'isConnecting'
  | 'hasError'
  | 'isUploadingAssets'
  | 'isCreatingFiles'
  | 'isConnected'
  | 'ethAddress'
  | 'project'
  | 'deploymentStatus'
  | 'deploymentProgress'
>

export type MapDispatchProps = Pick<Props, 'onConnect' | 'onClearDeployment'>

export type MapDispatch = Dispatch<ConnectWalletRequestAction | ClearDeploymentRequestAction>
