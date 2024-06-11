import * as React from 'react'
import { config } from 'config'
import { Link } from 'react-router-dom'
import { Button, Loader, Header, Row } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { DeploymentStatus } from 'modules/deployment/types'
import { coordsToId, getExplorerURL } from 'modules/land/utils'
import { getDeployment, getStatus } from 'modules/deployment/utils'
import { locations } from 'routing/locations'
import Icon from 'components/Icon'
import LandAtlas from './LandAtlas'
import { hasEnoughSpaceForScene } from './utils'
import { Props, State, DeployToLandView } from './DeployToLand.types'
import './DeployToLand.css'
import { getThumbnailUrl } from 'modules/project/utils'

const MARKETPLACE_WEB_URL = config.get('MARKETPLACE_WEB_URL', '')
export default class DeployToLand extends React.PureComponent<Props, State> {
  state: State = {
    placement: null,
    needsConfirmation: false,
    coords: null,
    view: DeployToLandView.NONE
  }

  analytics = getAnalytics()

  componentDidMount() {
    this.props.onRecord()
  }

  componentWillReceiveProps(props: Props) {
    const { project, deployments } = props
    if (deployments.length > 0) {
      const landDeployments = deployments.filter(deployment => !deployment.world)
      const deployment = getDeployment(project, landDeployments)
      if (deployment) {
        this.setState({
          placement: { ...deployment.placement }
        })
      }
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
      isLoading: isDeploymentLoading,
      media,
      project,
      deploymentsByCoord,
      error,
      landTiles
    } = this.props
    const { coords, needsConfirmation } = this.state
    const isLoading = isRecording || isUploadingAssets || isCreatingFiles || isUploadingRecording || isDeploymentLoading
    let view: DeployToLandView = DeployToLandView.NONE

    const deployment = coords && deploymentsByCoord[coords]

    if (!isConnected) {
      view = DeployToLandView.CONNECT
    } else if (isConnected && isLoading && !error) {
      view = DeployToLandView.PROGRESS
    } else if (isConnected && media && !Object.keys(landTiles).length) {
      view = DeployToLandView.EMPTY
    } else if (isConnected && media && !hasEnoughSpaceForScene(project, landTiles)) {
      view = DeployToLandView.NOT_ENOUGH_LAND
    } else if (isConnected && media && !needsConfirmation) {
      view = DeployToLandView.MAP
    } else if (!isLoading && deployment && getStatus(project, deployment) === DeploymentStatus.PUBLISHED) {
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
    this.props.history.push(locations.root())
    this.props.onClose()
  }

  handleBack = () => {
    const { view } = this.state

    if (view === DeployToLandView.CONFIRMATION) {
      this.setState({ view: DeployToLandView.MAP, needsConfirmation: false })
    } else if (view === DeployToLandView.MAP || view === DeployToLandView.EMPTY || view === DeployToLandView.NOT_ENOUGH_LAND) {
      this.props.onBack()
    }
  }

  handleDeploy = () => {
    const { placement, overrideDeploymentId } = this.state
    const { project } = this.props

    if (placement && project) {
      this.setState({ needsConfirmation: true, coords: coordsToId(placement.point.x, placement.point.y) })
      this.props.onDeploy(project.id, placement, overrideDeploymentId)
    }
  }

  handleConnect = () => {
    this.props.onOpenModal('WalletLoginModal')
  }

  handleConfirmPlacement = (placement: State['placement'], overrideDeploymentId?: string) => {
    this.setState({
      placement,
      overrideDeploymentId,
      needsConfirmation: true
    })
  }

  handleDeployToPool = () => {
    this.props.onDeployToPool()
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
    const { media, project, error, scene, deployments } = this.props
    const { placement } = this.state
    const { rows, cols } = project.layout

    const thumbnailUrl = getThumbnailUrl(project, scene, media)

    return (
      <div className="DeployToLand confirmation">
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.handleClose} />
          {deployments.length === 0 && <Icon name="modal-back" onClick={this.handleBack} />}
        </div>
        <Header size="large" className="modal-title">
          {t('deployment_modal.pool.title')}
        </Header>
        <p className="modal-subtitle">{t('deployment_modal.land.confirmation.description')}</p>

        <div className="details">
          <img src={thumbnailUrl} alt={project.title} />

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
    const { media, project, deployments, deploymentsByCoord, landTiles, isLoggedIn, scene } = this.props
    const landDeployments = deployments.filter(deployment => !deployment.world)
    const deployment = getDeployment(project, landDeployments)

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
          scene={scene}
          media={media}
          project={project}
          deploymentsByCoord={deploymentsByCoord}
          landTiles={landTiles}
          deployment={deployment}
          onConfirmPlacement={this.handleConfirmPlacement}
          onNoAuthorizedParcels={this.handleDeployToPool}
          isLoggedIn={isLoggedIn}
        />
      </div>
    )
  }

  renderEmpty = () => {
    const { layout } = this.props.project
    return (
      <div className="DeployToLand empty">
        <div className="empty-modal-header">
          <button className="navigation-button" onClick={this.handleBack}>
            <Icon name="modal-back" />
          </button>
          <Header size="large" className="modal-title">
            {t('deployment_modal.land.empty.title')}
          </Header>
          <button className="navigation-button" onClick={this.handleClose}>
            <Icon name="modal-close" />
          </button>
        </div>
        <div className="modal-body">
          <div className="thumbnail" aria-label="No land" role="img" />
          <span className="description">
            {t('deployment_modal.land.empty.description', {
              br: () => <br />,
              b: (text: string) => <b>{text}</b>,
              dimension: layout.rows,
              landSize: `${layout.rows}x${layout.cols}`
            })}
          </span>
        </div>
        <div className="actions">
          <Button
            primary
            className="action-button"
            as="a"
            href={`${MARKETPLACE_WEB_URL}/lands?assetType=nft&section=land&isMap=false&isFullscreen=false&vendor=decentraland&page=1&sortBy=newest&onlyOnSale=true`}
            target="_blank"
          >
            {t('deployment_modal.land.empty.buy_land')}
          </Button>
          <Button
            secondary
            className="action-button"
            as="a"
            href={`${MARKETPLACE_WEB_URL}/lands?assetType=nft&section=land&isMap=false&isFullscreen=false&vendor=decentraland&page=1&sortBy=newest&onlyOnRent=true`}
            target="_blank"
          >
            {t('deployment_modal.land.empty.rent_land')}
          </Button>
        </div>
      </div>
    )
  }

  renderNotEnoughLand = () => {
    const { project, ensList, onDeployToWorld } = this.props

    if (!project) return <></>

    return (
      <div className="DeployToLand empty">
        <div className="empty-modal-header">
          <button className="navigation-button" onClick={this.handleBack}>
            <Icon name="modal-back" />
          </button>
          <Header size="large" className="modal-title">
            {t('deployment_modal.land.not_enough_land.title')}
          </Header>
          <button className="navigation-button" onClick={this.handleClose}>
            <Icon name="modal-close" />
          </button>
        </div>
        <div className="modal-body">
          <div className="thumbnail" aria-label="No land" role="img" />
          <span className="description">
            {t('deployment_modal.land.not_enough_land.description', {
              rows: project?.layout.rows,
              cols: project?.layout.cols
            })}
          </span>
        </div>
        <div className="actions">
          {ensList.length ? (
            <Button primary className="action-button" onClick={onDeployToWorld}>
              {t('deployment_modal.land.not_enough_land.publish_world')}
            </Button>
          ) : (
            <Button primary as={Link} className="action-button" to={`${MARKETPLACE_WEB_URL}/names/mints`}>
              {t('deployment_modal.land.not_enough_land.claim_name')}
            </Button>
          )}
          <Button secondary className="action-button" as={Link} to={locations.scenes()}>
            {t('deployment_modal.land.not_enough_land.return_scenes')}
          </Button>
        </div>
      </div>
    )
  }

  renderSuccess = () => {
    const { placement } = this.state
    const { x, y } = placement!.point
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
          <Button size="small" primary href={getExplorerURL(x, y)} target="_blank" rel="no:opener no:referrer">
            {t('deployment_modal.land.success.jump_in')}
          </Button>

          <Button className="hollow" secondary size="small" onClick={this.handleClose}>
            {t('deployment_modal.land.success.continue')}
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

    if (view === DeployToLandView.EMPTY) return this.renderEmpty()

    if (view === DeployToLandView.NOT_ENOUGH_LAND) return this.renderNotEnoughLand()

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
