import * as React from 'react'
import { Button, Loader, Header, Row } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { DeploymentStatus } from 'modules/deployment/types'
import Icon from 'components/Icon'
import LandAtlas from './LandAtlas'
import { Props, State, DeployToLandView } from './DeployToLand.types'
import './DeployToLand.css'

export default class DeployToLand extends React.PureComponent<Props, State> {
  state: State = {
    placement: null,
    needsConfirmation: false,
    view: DeployToLandView.NONE
  }

  analytics = getAnalytics()

  componentDidMount() {
    this.props.onRecord()
    this.props.onConnect()
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

  componentWillUpdate(_: Props, nextState: State) {
    if (nextState.view !== this.state.view) {
      this.analytics.track('Publish to LAND step', { step: nextState.view })
    }
  }

  componentDidUpdate() {
    const {
      isConnected,
      isRecording,
      isUploadingAssets,
      isCreatingFiles,
      isUploadingRecording,
      media,
      deploymentStatus,
      deployment,
      error
    } = this.props
    const { needsConfirmation } = this.state
    const isLoading = isRecording || isUploadingAssets || isCreatingFiles || isUploadingRecording
    let view: DeployToLandView = DeployToLandView.NONE

    if (!isConnected) {
      view = DeployToLandView.CONNECT
    } else if (isConnected && isLoading && !error) {
      view = DeployToLandView.PROGRESS
    } else if (isConnected && media && !needsConfirmation && !deployment) {
      view = DeployToLandView.MAP
    } else if (!isLoading && needsConfirmation && deploymentStatus === DeploymentStatus.PUBLISHED) {
      view = DeployToLandView.SUCCESS
    } else if (isConnected && media && (!isLoading || error) && needsConfirmation) {
      view = DeployToLandView.CONFIRMATION
    }

    this.setState({ view })
  }

  handleClose = () => {
    const { view } = this.state
    if (view !== DeployToLandView.PROGRESS) {
      this.props.onClose()
    }
  }

  handleNavigateHome = () => {
    this.props.onNavigateHome()
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
    this.props.onConnect()
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

  handleClearDeployment = (projectId: string) => {
    this.props.onClearDeployment(projectId)
  }

  renderConnectForm = () => {
    const { walletError, isConnecting } = this.props
    let errorClasses = 'error'

    if (walletError) {
      errorClasses += ' visible'
    }

    return (
      <div className="DeployToLand connect">
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.handleClose} />
        </div>
        <Header size="large" className="modal-title">
          {t('deployment_modal.land.connect.title')}
        </Header>
        <p className="modal-subtitle">{t('deployment_modal.land.connect.description')}</p>

        <Button className="connect" primary size="small" onClick={this.handleConnect} disabled={isConnecting}>
          {isConnecting ? <T id="@dapps.sign_in.connecting" /> : <T id="@dapps.sign_in.connect" />}
        </Button>

        <p className={errorClasses}>
          <T id="@dapps.sign_in.error" />
        </p>
      </div>
    )
  }

  renderProgress = () => {
    const { mediaProgress, deploymentProgress, isRecording, isCreatingFiles, isUploadingAssets, isUploadingRecording } = this.props

    let classes = 'progress-bar active'

    const progress = isRecording ? mediaProgress : deploymentProgress.value

    if (progress === 100) {
      classes += ' active'
    }

    return (
      <div className="DeployToLand progress">
        <Header size="large" className="modal-title">
          {isUploadingAssets && t('deployment_modal.land.progress.uploading_assets.title')}
          {isRecording && t('deployment_modal.land.progress.recording.title')}
          {isCreatingFiles && t('deployment_modal.land.progress.creating_files.title')}
          {isUploadingRecording && t('deployment_modal.land.progress.uploading_recording.title')}
        </Header>
        <p className="modal-subtitle">
          {isUploadingAssets && t('deployment_modal.land.progress.uploading_assets.description')}
          {isCreatingFiles && t('deployment_modal.land.progress.creating_files.description')}
          {isRecording && t('deployment_modal.land.progress.recording.description')}
          {isUploadingRecording && t('deployment_modal.land.progress.uploading_recording.description')}
        </p>
        <div className="progress-bar-container">
          <div className={classes} style={{ width: `${progress}%` }} />
        </div>
      </div>
    )
  }

  renderConfirmation = () => {
    const { media, project, error, deployment } = this.props
    const { placement } = this.state
    const { rows, cols } = project.layout

    return (
      <div className="DeployToLand confirmation">
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.handleClose} />
          {!deployment && <Icon name="modal-back" onClick={this.handleBack} />}
        </div>
        <Header size="large" className="modal-title">
          {t('deployment_modal.pool.title')}
        </Header>
        <p className="modal-subtitle">{t('deployment_modal.land.confirmation.description')}</p>

        <div className="details">
          <img src={media ? media.preview : ''} />

          <div className="details-row">
            <div className="detail">
              <span className="label">{t('deployment_modal.land.confirmation.title_label')}</span>
              <span className="value">{project.title}</span>
            </div>

            <div className="detail">
              <span className="label">{t('deployment_modal.land.confirmation.size_label')}</span>
              <span className="value">{rows * cols}</span>
            </div>

            <div className="detail">
              <span className="label">{t('deployment_modal.land.confirmation.location_label')}</span>
              <span className="value">{`${placement!.point.x}, ${placement!.point.y}`}</span>
            </div>
          </div>
        </div>
        <Row align="center">
          <Button primary size="small" onClick={this.handleDeploy}>
            {t('deployment_modal.land.confirmation.action')}
          </Button>
        </Row>
        {error && <div className="error visible">{error}</div>}
      </div>
    )
  }

  renderMap = () => {
    const { ethAddress, media, project, deployment, occupiedParcels, onFetchDeployments, isLoggedIn } = this.props
    const initialPoint = deployment ? deployment.placement.point : undefined
    return (
      <div className="DeployToLand atlas">
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.handleClose} />
          <Header size="large" className="modal-title">
            {t('deployment_modal.land.map.title')}
          </Header>
          <Icon name="modal-back" onClick={this.handleBack} />
        </div>
        <LandAtlas
          ethAddress={ethAddress}
          media={media}
          project={project}
          occupiedParcels={occupiedParcels}
          initialPoint={initialPoint}
          onConfirmPlacement={this.handleConfirmPlacement}
          onNoAuthorizedParcels={this.handleDeployToPool}
          onClearDeployment={this.handleClearDeployment}
          onFetchDeployments={onFetchDeployments}
          isLoggedIn={isLoggedIn}
        />
      </div>
    )
  }

  renderSuccess = () => {
    return (
      <div className="DeployToLand success">
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.handleClose} />
        </div>
        <Header size="large" className="modal-title">
          {t('deployment_modal.land.success.title')}
        </Header>
        <p className="modal-subtitle">{t('deployment_modal.land.success.description')}</p>
        <div className="actions">
          <Button size="small" primary onClick={this.handleClose}>
            {t('deployment_modal.land.success.continue')}
          </Button>

          <Button className="hollow" size="small" secondary onClick={this.handleNavigateHome}>
            {t('deployment_modal.land.success.back_home')}
          </Button>
        </div>
      </div>
    )
  }

  renderView = () => {
    const { view } = this.state

    if (view === DeployToLandView.CONNECT) return this.renderConnectForm()

    if (view === DeployToLandView.PROGRESS) return this.renderProgress()

    if (view === DeployToLandView.MAP) return this.renderMap()

    if (view === DeployToLandView.SUCCESS) return this.renderSuccess()

    if (view === DeployToLandView.CONFIRMATION) return this.renderConfirmation()

    return <Loader size="big" />
  }

  wrapInModal = (view: JSX.Element) => {
    const { name } = this.props
    return (
      <Modal name={name} onClose={this.handleClose}>
        {view}
      </Modal>
    )
  }

  render() {
    return this.wrapInModal(this.renderView())
  }
}
