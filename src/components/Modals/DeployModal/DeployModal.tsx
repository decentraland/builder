import * as React from 'react'
import { Field, Form, Loader, Button, Radio } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import ProjectFields from 'components/ProjectFields'

import { EMAIL_INTEREST, api } from 'lib/api'
import { Props, State } from './DeployModal.types'
import './DeployModal.css'

export default class DeployModal extends React.PureComponent<Props, State> {
  state = this.getBaseState()

  getBaseState(): State {
    const { currentProject, userEmail, userEthAddress } = this.props
    return {
      email: userEmail,
      ethAddress: userEthAddress,
      isLoading: false,
      project: { ...currentProject! }
    }
  }

  handleSubmitEmail = async () => {
    const { email } = this.state
    const analytics = getAnalytics()

    this.props.onSetEmail(email)
    this.setState({ isLoading: true })
    analytics.identify({ email })
    api.reportEmail(email, EMAIL_INTEREST.PUBLISH).catch(() => console.error('Unable to submit email, something went wrong!'))
    this.setState({ isLoading: false })
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

  handleToggleTermsAndConditions = () => {
    /* stub */
  }

  handleSubmit = async () => {
    const { currentProject, onPublishToPool, onSaveProject, onSaveUser } = this.props
    const { email, ethAddress, project } = this.state
    const projectId = currentProject!.id

    api.reportEmail(email, EMAIL_INTEREST.PUBLISH_POOL).catch(() => console.error('Unable to submit email, something went wrong!'))

    onSaveUser(email, ethAddress)
    onSaveProject(projectId, project)
    onPublishToPool(projectId, email, ethAddress)
  }

  renderForm() {
    const { error } = this.props
    const { project, email, ethAddress } = this.state
    const { title, description } = project

    return (
      <>
        <div className="subtitle">{t('deployment_modal.pool.subtitle')}</div>
        <div className="details">
          <div className="category">{t('global.project')}</div>
          <ProjectFields.Title value={title} onChange={this.handleTitleChange} required />
          <ProjectFields.Description value={description} onChange={this.handleDescriptionChange} />
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
            required
          />
          <Field
            label={`${t('global.eth_address')} (${t('global.optional')})`}
            placeholder="0x"
            value={ethAddress}
            onChange={this.handleEthAddressChange}
          />
          <div className="terms">
            <span onClick={this.handleToggleTermsAndConditions}>
              <Radio defaultChecked={false} checked={false} label="" />
            </span>
            <span>
              {t('deployment_modal.pool.i_accept_the')}
              <a href="https://decentraland.org/terms" rel="noopener noreferrer" target="_blank">
                {t('global.terms_and_conditions')}
              </a>
            </span>
          </div>
          {error ? (
            <div className="error">
              {t('deployment_modal.pool.error_occurred')} "{error}"
            </div>
          ) : null}
        </div>
      </>
    )
  }

  renderSuccess() {
    const { name, onClose } = this.props

    return (
      <Modal name={name}>
        <Modal.Header>{t('add_to_contest.success_title')}</Modal.Header>
        <Modal.Content>{t('add_to_contest.success_subtitle')}</Modal.Content>
        <Modal.Actions>
          <Button primary onClick={onClose}>
            {t('global.done')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }

  render() {
    const { name, onClose } = this.props
    const { isLoading } = this.state
    return (
      <Modal name={name}>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>{t('deployment_modal.pool.title')}</Modal.Header>
          <Modal.Content>{this.renderForm()}</Modal.Content>
          <Modal.Actions>
            {isLoading ? (
              <Loader size="large" />
            ) : (
              <>
                <Button primary>{t('global.submit')}</Button>
                <Button secondary onClick={onClose}>
                  {t('global.cancel')}
                </Button>
              </>
            )}
          </Modal.Actions>
        </Form>
      </Modal>
    )
  }
}
