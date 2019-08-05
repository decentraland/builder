import * as React from 'react'
import { Field, Form, Button, Header, Loader } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import ProjectFields from 'components/ProjectFields'
import Icon from 'components/Icon'
import { EMAIL_INTEREST } from 'lib/api/email'
import { api } from 'lib/api'

import { Props, State } from './DeployToPool.types'
import './DeployToPool.css'

export default class DeployModal extends React.PureComponent<Props, State> {
  state = this.getBaseState()

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
      ...this.getBaseState(),
      isSubmitting: false,
      isSuccess: false
    })
  }

  getBaseState(): State {
    const { currentProject, userEmail, ethAddress } = this.props
    return {
      email: userEmail,
      ethAddress: ethAddress || '',
      project: { ...currentProject! },
      isSubmitting: false,
      isSuccess: false
    }
  }

  handleTitleChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { project } = this.state
    const title = event.currentTarget.value
    this.setState({ project: { ...project, title } })
  }

  handleDescriptionChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { project } = this.state
    const description = event.currentTarget.value
    this.setState({ project: { ...project, description } })
  }

  handleEmailChange = (event: React.FormEvent<HTMLInputElement>) => {
    const email = event.currentTarget.value
    this.setState({ email })
  }

  handleEthAddressChange = (event: React.FormEvent<HTMLInputElement>) => {
    const ethAddress = event.currentTarget.value
    this.setState({ ethAddress })
  }

  handleSubmit = async () => {
    const { currentProject, onDeployToPool, onSaveProject, onSaveUser } = this.props
    const { email, project } = this.state
    const projectId = currentProject!.id

    this.setState({ isSubmitting: true })

    this.analytics.identify({ email })
    api.reportEmail(email, EMAIL_INTEREST.PUBLISH_POOL).catch(() => console.error('Unable to submit email, something went wrong!'))

    onSaveUser({ email })
    onSaveProject(projectId, project)
    onDeployToPool(projectId)
  }

  handleClose = () => {
    const { isLoading, isRecording, isUploadingRecording } = this.props
    if (!isLoading && !isRecording && !isUploadingRecording) {
      this.props.onClose()
    }
  }

  renderForm() {
    const { error, isLoading } = this.props
    const { project, email, ethAddress } = this.state
    const { title, description } = project
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
        <Form className="form" onSubmit={this.handleSubmit}>
          <ProjectFields.Title value={title} onChange={this.handleTitleChange} required disabled={isLoading} />
          <ProjectFields.Description value={description} onChange={this.handleDescriptionChange} disabled={isLoading} />
          <Field
            type="email"
            label={t('global.email')}
            placeholder="mail@domain.com"
            value={email}
            onChange={this.handleEmailChange}
            disabled={isLoading}
            required
          />
          <Field
            label={`${t('global.eth_address')} (${t('global.optional')})`}
            placeholder="0x"
            value={ethAddress}
            onChange={this.handleEthAddressChange}
            disabled={isLoading}
          />
          <div className="terms">
            <span>{t('deployment_modal.pool.i_accept_the')}</span>
          </div>
          {error ? (
            <div className="error">
              {t('deployment_modal.pool.error_ocurred')} "{error}"
            </div>
          ) : null}

          <Button className="submit" primary size="small" disabled={isSubmitDisabled}>
            {t('deployment_modal.pool.action')}
          </Button>
        </Form>
      </div>
    )
  }

  renderSuccess() {
    const { media, onClose } = this.props

    return (
      <div className="DeployToPool success">
        <img src={media ? media.thumbnail : ''} className="preview" />
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

  renderView = () => {
    const { isRecording, isUploadingRecording, isLoading } = this.props
    const hasProgress = isRecording || isUploadingRecording

    if (this.state.isSuccess) return this.renderSuccess()
    if (hasProgress) return this.renderProgress()
    if (!hasProgress && !isLoading) return this.renderForm()

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
