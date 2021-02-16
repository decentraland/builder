import * as React from 'react'
import { Button, Loader, Header } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import Icon from 'components/Icon'
import { Props, State } from './ClearDeployment.types'
import './ClearDeployment.css'

export default class ClearDeployment extends React.PureComponent<Props, State> {
  state: State = {
    hasError: false,
    needsConfirmation: true
  }

  analytics = getAnalytics()

  componentDidMount() {
    this.analytics.track('Unpublish Scene')
  }

  handleClearDeploy = () => {
    const { deployment } = this.props

    if (deployment) {
      this.props.onClearDeployment(deployment.id)
    }
  }

  handleConnect = () => {
    this.props.onOpenModal('WalletLoginModal')
  }

  renderConnectForm = () => {
    const { hasError, isConnecting } = this.props
    let errorClasses = 'error'

    if (hasError) {
      errorClasses += ' visible'
    }

    return (
      <div className="ClearDeployment">
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.props.onClose} />
        </div>
        <Header size="large" className="modal-title">
          {t('deployment_modal.clear.connect.title')}
        </Header>
        <p className="modal-subtitle">{t('deployment_modal.clear.connect.description')}</p>

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
    const { deploymentProgress, isCreatingFiles, isUploadingAssets } = this.props

    let classes = 'progress-bar'

    const progress = deploymentProgress.value

    if (progress === 100) {
      classes += ' active'
    }

    return (
      <div className="ClearDeployment progress">
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
    const { deployment, error } = this.props

    return (
      <div className="ClearDeployment confirmation">
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.props.onClose} />
        </div>
        <Header size="large" className="modal-title">
          {t('deployment_modal.clear.confirmation.title')}
        </Header>
        <p className="modal-subtitle">
          <T id="deployment_modal.clear.confirmation.description" values={{ project: deployment!.name, coords: deployment!.base }} />
        </p>

        <Button primary size="small" onClick={this.handleClearDeploy}>
          {t('deployment_modal.clear.confirmation.action')}
        </Button>

        {error && <div className="error visible">{error}</div>}
      </div>
    )
  }

  renderSuccess = () => {
    return (
      <div className="ClearDeployment success">
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.props.onClose} />
        </div>
        <Header size="large" className="modal-title">
          {t('deployment_modal.clear.success.title')}
        </Header>
        <p className="modal-subtitle">{t('deployment_modal.clear.success.description')}</p>
        <Button size="small" primary onClick={this.props.onClose}>
          {t('deployment_modal.clear.success.continue')}
        </Button>
      </div>
    )
  }

  renderView = () => {
    const { isConnected, isUploadingAssets, isCreatingFiles, deployment, error } = this.props
    const { needsConfirmation } = this.state
    const isLoading = isUploadingAssets || isCreatingFiles

    if (!isConnected) return this.renderConnectForm()

    if (isConnected && isLoading && !error) return this.renderProgress()

    if (!isLoading && needsConfirmation && !deployment) return this.renderSuccess()

    if (isConnected && (!isLoading || error) && needsConfirmation) return this.renderConfirmation()

    return <Loader size="big" />
  }

  render() {
    const { name, onClose } = this.props
    return (
      <Modal name={name} onClose={onClose}>
        {this.renderView()}
      </Modal>
    )
  }
}
