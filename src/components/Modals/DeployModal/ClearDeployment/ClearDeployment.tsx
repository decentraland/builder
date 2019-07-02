import * as React from 'react'
import { Button, Loader, Header } from 'decentraland-ui'
import { T } from 'decentraland-dapps/dist/modules/translation/utils'
import { DeploymentStatus } from 'modules/deployment/types'
import { Props, State } from './ClearDeployment.types'
import './ClearDeployment.css'

export default class ClearDeployment extends React.PureComponent<Props, State> {
  state: State = {
    hasError: false,
    needsConfirmation: true
  }

  handleDeploy = () => {
    const { project } = this.props

    if (project) {
      this.props.onClearDeployment(project.id)
    }
  }

  handleConnect = () => {
    this.props.onConnect!()
  }

  renderConnectForm = () => {
    const { hasError, isConnecting } = this.props
    let errorClasses = 'error'

    if (hasError) {
      errorClasses += ' visible'
    }

    return (
      <div className="DeployToLand">
        <Header size="large" className="modal-title">
          Unpublish scene
        </Header>
        <p className="modal-subtitle">Connect your wallet to continue.</p>

        <Button className="connect" primary onClick={this.handleConnect} disabled={isConnecting}>
          {isConnecting ? <T id="@dapps.sign_in.connecting" /> : <T id="@dapps.sign_in.connect" />}
        </Button>

        <p className={errorClasses}>
          <T id="@dapps.sign_in.error" />
        </p>
      </div>
    )
  }

  renderProgress = () => {
    const { deploymentProgress, isCreatingFiles, isUploadingAssets } = this.props

    let classes = 'progress-bar'

    const progress = deploymentProgress.value

    if (progress === 100) {
      classes += ' active'
    }

    return (
      <div className="DeployToLand progress">
        <Header size="large" className="modal-title">
          {isUploadingAssets && 'Uploading assets'}
          {isCreatingFiles && 'Creating Asset files'}
        </Header>
        <p className="modal-subtitle">
          {isUploadingAssets && 'Please wait while your scene is uploaded.'}
          {isCreatingFiles && 'Please wait while create the files that will be uploaded.'}
        </p>
        <div className="progress-bar-container">
          <div className={classes} style={{ width: `${progress}%` }} />
        </div>
      </div>
    )
  }

  renderConfirmation = () => {
    const { project } = this.props

    return (
      <div className="DeployToLand confirmation">
        <Header size="large" className="modal-title">
          Unpublish Scene
        </Header>
        <p className="modal-subtitle">You are about to unpublish "{project!.title}" from the Metaverse:</p>

        <Button primary size="small" onClick={this.handleDeploy}>
          continue
        </Button>
      </div>
    )
  }

  renderSuccess = () => {
    return (
      <div className="DeployToLand progress">
        <Header size="large" className="modal-title">
          All clear!
        </Header>
        <p className="modal-subtitle">The land is now clear and ready to host something else!</p>
        <Button size="small" primary>
          Keep working
        </Button>
        <Button size="small" secondary>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  render() {
    const { isConnected, isUploadingAssets, isCreatingFiles, deploymentStatus } = this.props
    const { needsConfirmation } = this.state
    const isLoading = isUploadingAssets || isCreatingFiles

    if (!isConnected) return this.renderConnectForm()

    if (isConnected && isLoading) return this.renderProgress()

    if (!isLoading && needsConfirmation && deploymentStatus === DeploymentStatus.UNPUBLISHED) return this.renderSuccess()

    if (isConnected && !isLoading && needsConfirmation) return this.renderConfirmation()

    return <Loader size="big" />
  }
}
