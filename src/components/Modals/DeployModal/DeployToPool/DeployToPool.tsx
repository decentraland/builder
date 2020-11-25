import * as React from 'react'
import { Button, Header, Loader } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { ShareModalType, ShareModalMetadata } from 'components/Modals/ShareModal/ShareModal.types'
import Icon from 'components/Icon'

import { Props, State } from './DeployToPool.types'
import './DeployToPool.css'

export default class DeployToLand extends React.PureComponent<Props, State> {
  state = {
    isSubmitting: false,
    isSuccess: false
  }

  analytics = getAnalytics()

  componentDidMount() {
    this.analytics.track('Publish to Pool')
  }

  componentWillReceiveProps(nextProps: Props) {
    const { isLoading, error } = nextProps

    if (this.state.isSubmitting && !isLoading && !error) {
      this.setState({
        isSubmitting: false,
        isSuccess: true
      })
    }
  }

  componentWillUnmount() {
    this.setState({
      isSubmitting: false,
      isSuccess: false
    })
  }

  handleSubmit = async () => {
    const { project, onDeployToPool } = this.props
    const projectId = project!.id

    this.setState({ isSubmitting: true })

    onDeployToPool(projectId)
  }

  handleClose = () => {
    const { isLoading, isRecording, isUploadingRecording } = this.props
    if (!isLoading && !isRecording && !isUploadingRecording) {
      this.props.onClose()
    }
  }

  handleLogin = () => {
    const { onLogin } = this.props

    onLogin()
  }

  handleShare = () => {
    const { project, onOpenModal } = this.props
    const projectId = project!.id

    onOpenModal('ShareModal', {
      type: ShareModalType.POOL,
      id: projectId
    } as ShareModalMetadata)
  }

  renderSubmit() {
    const { error, isReady } = this.props

    return (
      <div className="DeployToPool">
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.handleClose} />
        </div>
        <Header size="large" className="modal-title">
          {t('deployment_modal.pool.title')}
        </Header>
        <p className="modal-subtitle">{t('deployment_modal.pool.subtitle')}</p>
        {error ? (
          <div className="error">
            {t('global.error_ocurred')} "{error}"
          </div>
        ) : null}
        <Button className="submit" primary size="small" onClick={this.handleSubmit} loading={!isReady} disabled={!isReady}>
          {t('deployment_modal.pool.action')}
        </Button>
      </div>
    )
  }

  renderSuccess() {
    const { media, onClose } = this.props

    return (
      <div className="DeployToPool success">
        <img src={media ? media.preview : ''} className="preview" />
        <Header size="large" className="modal-title">
          {t('deployment_modal.pool.success.title')}
        </Header>
        <p className="modal-subtitle">{t('deployment_modal.pool.success.body')}</p>
        <div>
          <Button className="submit" size="small" primary onClick={this.handleShare}>
            {t('global.share')}
          </Button>
          <Button className="submit" size="small" secondary onClick={onClose}>
            {t('global.done')}
          </Button>
        </div>
      </div>
    )
  }

  renderProgress() {
    const { isRecording, progress } = this.props

    let classes = 'progress-bar'
    if (progress === 100) {
      classes += ' active'
    }

    return (
      <div className="DeployToPool progress">
        <Header size="large" className="modal-title">
          {isRecording
            ? t('deployment_modal.land.progress.recording.title')
            : t('deployment_modal.land.progress.uploading_recording.title')}
        </Header>
        <p className="modal-subtitle">
          {isRecording
            ? t('deployment_modal.land.progress.creating_files.description')
            : t('deployment_modal.land.progress.uploading_recording.description')}
        </p>
        <div className="progress-bar-container">
          <div className={classes} style={{ width: `${progress}%` }} />
        </div>
      </div>
    )
  }

  renderLogin() {
    return (
      <div className="DeployToPool">
        <div className="modal-header">
          <Icon name="modal-close" onClick={this.handleClose} />
        </div>
        <Header size="large" className="modal-title">
          {t('deployment_modal.pool.sign_in.title')}
        </Header>
        <p className="modal-subtitle">{t('deployment_modal.pool.sign_in.subtitle')}</p>
        <Button className="submit" primary size="small" onClick={this.handleLogin}>
          {t('global.sign_in')}
        </Button>
      </div>
    )
  }

  renderView = () => {
    const { isRecording, isUploadingRecording, isLoading, isLoggedIn } = this.props
    const hasProgress = isRecording || isUploadingRecording

    if (this.state.isSuccess) return this.renderSuccess()
    if (hasProgress) return this.renderProgress()
    if (!hasProgress && !isLoading && isLoggedIn) return this.renderSubmit()
    if (!isLoggedIn) return this.renderLogin()

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
