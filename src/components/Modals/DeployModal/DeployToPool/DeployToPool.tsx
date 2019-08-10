import * as React from 'react'
import { Button, Header, Loader } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { EMAIL_INTEREST } from 'lib/api/email'
import { api } from 'lib/api'

import { Props, State } from './DeployToPool.types'
import './DeployToPool.css'
import Icon from 'components/Icon'

export default class DeployModal extends React.PureComponent<Props, State> {
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
    const { project, email, onDeployToPool } = this.props
    const projectId = project!.id

    this.setState({ isSubmitting: true })

    this.analytics.identify({ email })
    api.reportEmail(email!, EMAIL_INTEREST.PUBLISH_POOL).catch(() => console.error('Unable to submit email, something went wrong!'))

    onDeployToPool(projectId)
  }

  handleClose = () => {
    const { isLoading, isRecording, isUploadingRecording } = this.props
    if (!isLoading && !isRecording && !isUploadingRecording) {
      this.props.onClose()
    }
  }

  handleLogin = () => {
    this.props.onLogin()
  }

  renderSubmit() {
    const { email, error } = this.props
    const isSubmitDisabled = !email

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
            {t('deployment_modal.pool.error_ocurred')} "{error}"
          </div>
        ) : null}
        <Button className="submit" primary size="small" disabled={isSubmitDisabled} onClick={this.handleSubmit}>
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
        <Button className="submit" size="small" primary onClick={onClose}>
          {t('global.done')}
        </Button>
      </div>
    )
  }

  renderProgress() {
    const { isRecording, isUploadingRecording, progress } = this.props

    let classes = 'progress-bar'
    if (progress === 100) {
      classes += ' active'
    }

    return (
      <div className="DeployToPool progress">
        <Header size="large" className="modal-title">
          {isRecording && t('deployment_modal.land.progress.recording.title')}
          {isUploadingRecording && t('deployment_modal.land.progress.uploading_recording.title')}
        </Header>
        <p className="modal-subtitle">
          {isRecording && t('deployment_modal.land.progress.creating_files.description')}
          {isUploadingRecording && t('deployment_modal.land.progress.uploading_recording.description')}
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
          {t('deployment_modal.pool.sign_in.action')}
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
