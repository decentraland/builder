import * as React from 'react'
import { Button, Loader, Header } from 'decentraland-ui'
import { T } from 'decentraland-dapps/dist/modules/translation/utils'
import LandAtlas from './LandAtlas'
import { Props, State } from './DeployToLand.types'
import './DeployToLand.css'
import { DeploymentStatus } from 'modules/deployment/types'

export default class DeployToLand extends React.PureComponent<Props, State> {
  state: State = {
    placement: null,
    hasError: false,
    needsConfirmation: false
  }

  componentDidMount() {
    this.props.onRecord()
  }

  handleDeploy = () => {
    const { placement } = this.state

    if (placement) {
      this.setState({ needsConfirmation: true })
      this.props.onDeploy(this.props.ethAddress!, placement)
    }
  }

  handleConnect = () => {
    this.props.onConnect!()
  }

  handleConfirmPlacement = (placement: State['placement']) => {
    this.setState({
      placement,
      needsConfirmation: true
    })
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
          Publish your scene
        </Header>
        <p className="modal-subtitle">Connect your wallet to continue. You sure have one if you own LAND.</p>

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
    const { mediaProgress, deploymentProgress, isRecording, isCreatingFiles, isUploadingAssets } = this.props

    let classes = 'progress-bar'

    const progress = isRecording ? mediaProgress : deploymentProgress.value

    if (progress === 100) {
      classes += ' active'
    }

    return (
      <div className="DeployToLand progress">
        <Header size="large" className="modal-title">
          {isUploadingAssets && 'Uploading assets'}
          {isRecording && 'Capturing Preview'}
          {isCreatingFiles && 'Creating Asset files'}
        </Header>
        <p className="modal-subtitle">
          {isUploadingAssets && 'Please wait while your scene is uploaded.'}
          {isCreatingFiles && 'Please wait while create the files that will be uploaded.'}
          {isRecording && 'Please wait while a preview of your scene is captured.'}
        </p>
        <div className="progress-bar-container">
          <div className={classes} style={{ width: `${progress}%` }} />
        </div>
      </div>
    )
  }

  renderConfirmation = () => {
    const { media, project } = this.props
    const { placement } = this.state

    return (
      <div className="DeployToLand confirmation">
        <Header size="large" className="modal-title">
          Publish Scene
        </Header>
        <p className="modal-subtitle">You are about to publish the following scene to the Metaverse:</p>

        <div className="details">
          <img src={media ? media.thumbnail : ''} />

          <div className="details-row">
            <div className="detail">
              <span className="label">Scene</span>
              <span className="value">{project!.title}</span>
            </div>

            <div className="detail">
              <span className="label">Size</span>
              <span className="value">{project!.parcels!.length}</span>
            </div>

            <div className="detail">
              <span className="label">Base</span>
              <span className="value">{`${placement!.point.x}, ${placement!.point.y}`}</span>
            </div>
          </div>
        </div>

        <Button primary size="small" onClick={this.handleDeploy}>
          Publish
        </Button>
      </div>
    )
  }

  renderMap = () => {
    const { ethAddress, media, project } = this.props
    return <LandAtlas ethAddress={ethAddress} media={media} project={project} onConfirmPlacement={this.handleConfirmPlacement} />
  }

  renderSuccess = () => {
    return (
      <div className="DeployToLand progress">
        <Header size="large" className="modal-title">
          Thank you!
        </Header>
        <p className="modal-subtitle">Your work is now available on the Metaverse</p>
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
    const { isConnected, isRecording, isUploadingAssets, isCreatingFiles, media, deploymentStatus } = this.props
    const { needsConfirmation } = this.state
    const isLoading = isRecording || isUploadingAssets || isCreatingFiles

    if (!isConnected) return this.renderConnectForm()

    if (isConnected && isLoading) return this.renderProgress()

    if (isConnected && media && !needsConfirmation) return this.renderMap()

    if (!isLoading && needsConfirmation && deploymentStatus === DeploymentStatus.PUBLISHED) return this.renderSuccess()

    if (isConnected && media && !isLoading && needsConfirmation) return this.renderConfirmation()

    return <Loader size="big" />
  }
}
