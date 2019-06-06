import * as React from 'react'
import { Field, Form, Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import ProjectFields from 'components/ProjectFields'

import { EMAIL_INTEREST, api } from 'lib/api'
import { Props, State } from './DeployModal.types'
import './DeployModal.css'

const ethereum = (window as any)['ethereum']

export default class DeployModal extends React.PureComponent<Props, State> {
  state = this.getBaseState()

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
    const { currentProject, userEmail } = this.props
    return {
      email: userEmail,
      ethAddress: ethereum.selectedAddress || '',
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
    const { email, project, ethAddress } = this.state
    const projectId = currentProject!.id
    const analytics = getAnalytics()

    this.setState({ isSubmitting: true })

    analytics.identify({ email })
    api.reportEmail(email, EMAIL_INTEREST.PUBLISH_POOL).catch(() => console.error('Unable to submit email, something went wrong!'))

    onSaveUser({ email })
    onSaveProject(projectId, project)
    onDeployToPool(projectId, ethAddress)
  }

  handleClose = () => {
    if (!this.props.isLoading) {
      this.props.onClose()
    }
  }

  renderForm() {
    const { error, isLoading } = this.props
    const { project, email, ethAddress } = this.state
    const { title, description } = project

    return (
      <>
        <div className="subtitle">{t('deployment_modal.pool.subtitle')}</div>
        <div className="details">
          <div className="category">{t('global.project')}</div>
          <ProjectFields.Title value={title} onChange={this.handleTitleChange} required disabled={isLoading} />
          <ProjectFields.Description value={description} onChange={this.handleDescriptionChange} disabled={isLoading} />
        </div>
        <div className="details">
          <div className="category">{t('deployment_modal.pool.contact_information')}</div>
          <Field
            type="email"
            label={t('global.email')}
            icon="asterisk"
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
        </div>
      </>
    )
  }

  renderSuccess() {
    const { name, deploymentThumbnail, onClose } = this.props

    return (
      <Modal name={name}>
        <img src={deploymentThumbnail || ''} className="preview" />
        <Modal.Header>{t('deployment_modal.pool.success.title')}</Modal.Header>
        <Modal.Content>
          <div className="success">{t('deployment_modal.pool.success.body')}</div>
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={onClose}>
            {t('global.done')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }

  renderProgress() {
    const { name, stage, progress } = this.props

    let classes = 'progress-bar'
    if (progress === 100) {
      classes += ' active'
    }

    let title
    switch (stage) {
      case 'record': {
        title = (
          <>
            {t('deployment_modal.pool.progress')}&hellip;&nbsp;{progress}%
          </>
        )
        break
      }
      case 'upload': {
        title = (
          <>
            {t('deployment_modal.pool.uploading')}&hellip;&nbsp;{progress}%
          </>
        )
        break
      }

      default:
        title = t('global.loading')
    }

    return (
      <Modal name={name} onClose={this.handleClose}>
        <Modal.Header>{title}</Modal.Header>
        <Modal.Content>
          <div className="progress-bar-container">
            <div className={classes} style={{ width: `${progress}%` }} />
          </div>
        </Modal.Content>
      </Modal>
    )
  }

  render() {
    const { name, onClose, isLoading } = this.props
    const { email } = this.state
    const isSubmitDisabled = !email

    if (this.state.isSuccess) {
      return this.renderSuccess()
    }

    if (isLoading) {
      return this.renderProgress()
    }

    return (
      <Modal name={name} onClose={this.handleClose}>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>{t('deployment_modal.pool.title')}</Modal.Header>
          <Modal.Content>{this.renderForm()}</Modal.Content>
          <Modal.Actions>
            <Button primary disabled={isSubmitDisabled}>
              {t('global.submit')}
            </Button>
            <Button secondary onClick={onClose}>
              {t('global.cancel')}
            </Button>
          </Modal.Actions>
        </Form>
      </Modal>
    )
  }
}
