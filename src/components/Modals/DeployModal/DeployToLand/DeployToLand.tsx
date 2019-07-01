import * as React from 'react'
import { Button, Loader, Header } from 'decentraland-ui'
import { T } from 'decentraland-dapps/dist/modules/translation/utils'
import { DeploymentStatus } from 'modules/deployment/types'
import LandAtlas from './LandAtlas'
import { Props, State, DeployToLandView } from './DeployToLand.types'
import './DeployToLand.css'
import Icon from 'components/Icon'

export default class DeployToLand extends React.PureComponent<Props, State> {
  state: State = {
    placement: null,
    hasError: false,
    needsConfirmation: false,
    view: DeployToLandView.NONE
  }

  componentDidMount() {
    this.props.onRecord()
  }

  componentWillReceiveProps(props: Props) {
    if (props.deployment) {
      // If a deployment exists, it means we can skip the Atlas (we are updating)
      this.setState({
        needsConfirmation: true,
        placement: { ...props.deployment.placement }
      })
    }
  }

  componentDidUpdate() {
    const { isConnected, isRecording, isUploadingAssets, isCreatingFiles, media, deploymentStatus, deployment } = this.props
    const { needsConfirmation } = this.state
    const isLoading = isRecording || isUploadingAssets || isCreatingFiles
    let view: DeployToLandView = DeployToLandView.NONE

    if (!isConnected) {
      view = DeployToLandView.CONNECT
    } else if (isConnected && isLoading) {
      view = DeployToLandView.PROGRESS
    } else if (isConnected && media && !needsConfirmation && !deployment) {
      view = DeployToLandView.MAP
    } else if (!isLoading && needsConfirmation && deploymentStatus === DeploymentStatus.PUBLISHED) {
      view = DeployToLandView.SUCCESS
    } else if (isConnected && media && !isLoading && needsConfirmation) {
      view = DeployToLandView.CONFIRMATION
    }

    this.setState({ view })
  }

  handleClose = () => {
    this.props.onClose()
  }

  handleBack = () => {
    const { view } = this.state

    if (view === DeployToLandView.CONFIRMATION) {
      this.setState({ view: DeployToLandView.MAP, needsConfirmation: false })
    } else if (view === DeployToLandView.MAP) {
      this.props.onBack()
    }
  }

  handleDeploy = () => {
    const { placement } = this.state
    const { project } = this.props

    if (placement && project) {
      this.setState({ needsConfirmation: true })
      this.props.onDeploy(project.id, placement)
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

  handleDeployToPool = () => {
    this.props.onDeployToPool()
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
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.handleClose} />
          <Icon name="modal-back" onClick={this.handleBack} />
        </div>
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
              <span className="label">Publish at</span>
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
    const { ethAddress, media, project, deployment } = this.props
    const initialPoint = deployment ? deployment.placement.point : undefined
    return (
      <div className="DeployToLand atlas">
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.handleClose} />
          <Header size="large" className="modal-title">
            Publish your scene
          </Header>
          <Icon name="modal-back" onClick={this.handleBack} />
        </div>
        <LandAtlas
          ethAddress={ethAddress}
          media={media}
          project={project}
          initialPoint={initialPoint}
          onConfirmPlacement={this.handleConfirmPlacement}
          onNoAuthorizedParcels={this.handleDeployToPool}
        />
      </div>
    )
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
    const { view } = this.state

    if (view === DeployToLandView.CONNECT) return this.renderConnectForm()

    if (view === DeployToLandView.PROGRESS) return this.renderProgress()

    if (view === DeployToLandView.MAP) return this.renderMap()

    if (view === DeployToLandView.SUCCESS) return this.renderSuccess()

    if (view === DeployToLandView.CONFIRMATION) return this.renderConfirmation()

    return <Loader size="big" />
  }
}
