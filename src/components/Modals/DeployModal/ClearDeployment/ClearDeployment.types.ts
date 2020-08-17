import { Dispatch } from 'redux'
import { SignInProps } from 'decentraland-ui'
import { EnableWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Deployment } from 'modules/deployment/types'
import { clearDeploymentRequest, ClearDeploymentRequestAction } from 'modules/deployment/actions'
import { DeploymentState } from 'modules/deployment/reducer'

export type Props = SignInProps & {
  error: string | null
  name: string
  deploymentId: string
  isConnected: boolean
  isUploadingAssets: boolean
  isCreatingFiles: boolean
  deploymentProgress: DeploymentState['progress']
  ethAddress: string | undefined
  deployment: Deployment | null
  onClose: () => void
  onClearDeployment: typeof clearDeploymentRequest
}

export type State = {
  hasError: boolean
  needsConfirmation: boolean
}

export type OwnProps = Pick<Props, 'deploymentId'>

export type MapStateProps = Pick<
  Props,
  | 'error'
  | 'isConnecting'
  | 'hasError'
  | 'isUploadingAssets'
  | 'isCreatingFiles'
  | 'isConnected'
  | 'ethAddress'
  | 'deployment'
  | 'deploymentProgress'
>

export type MapDispatchProps = Pick<Props, 'onConnect' | 'onClearDeployment'>

export type MapDispatch = Dispatch<EnableWalletRequestAction | ClearDeploymentRequestAction>
