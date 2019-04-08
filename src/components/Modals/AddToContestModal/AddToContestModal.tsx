import * as React from 'react'
import { Form, Field, Button, Loader, Radio } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { api, EMAIL_INTEREST } from 'lib/api'

import ProjectFields from 'components/ProjectFields'
import { preventDefault } from 'lib/preventDefault'
import { Props, State } from './AddToContestModal.types'
import './AddToContestModal.css'

export default class AddToContestModal extends React.PureComponent<Props, State> {
  state = this.getBaseState()

  isSubmitting = false
  isSuccess = false

  componentWillReceiveProps(nextProps: Props) {
    const { isLoading, error } = nextProps

    if (this.isSubmitting && !isLoading && !error) {
      this.isSubmitting = false
      this.isSuccess = true
    }
  }

  componentWillUnmount() {
    this.setState(this.getBaseState())
    this.isSubmitting = false
    this.isSuccess = false
  }

  handleSubmit = async () => {
    const { currentProject, onSaveProject, onSubmitProject } = this.props
    const { project, contest } = this.state
    const projectId = currentProject!.id

    this.isSubmitting = true

    api.reportEmail(contest.email, EMAIL_INTEREST.CONTEST).catch(() => console.error('Unable to submit email, something went wrong!'))

    onSaveProject(projectId, project)
    onSubmitProject(projectId, contest)
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
    const { contest } = this.state
    const email = event.currentTarget.value
    this.setState({ contest: { ...contest, email } })
  }

  handleEthAddressChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { contest } = this.state
    const ethAddress = event.currentTarget.value
    this.setState({ contest: { ...contest, ethAddress } })
  }

  handleUpbitChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { contest } = this.state
    const upbitId = event.currentTarget.value
    this.setState({ contest: { ...contest, upbitId } })
  }

  getBaseState(): State {
    const { contest, currentProject, userEmail, hasAcceptedTerms } = this.props
    return {
      project: { ...currentProject! },
      contest: { ...contest, email: contest.email || userEmail || '', hasAcceptedTerms }
    }
  }

  handleToggleTermsAndConditions = () => {
    const { contest } = this.state
    const hasAcceptedTerms = !contest.hasAcceptedTerms
    this.setState({ contest: { ...contest, hasAcceptedTerms } })
  }

  renderForm() {
    const { error } = this.props
    const { project, contest } = this.state
    const { title } = project
    const { email, ethAddress } = contest

    return (
      <>
        <div className="subtitle">{t('add_to_contest.subtitle')}</div>
        <div className="details">
          <div className="category">{t('global.project')}</div>
          <ProjectFields.Title value={title} onChange={this.handleTitleChange} required />
        </div>
        <div className="details">
          <div className="category">{t('add_to_contest.contact_information')}</div>
          <Field
            type="email"
            label={t('global.email')}
            icon="asterisk"
            placeholder="mail@domain.com"
            value={email}
            onChange={this.handleEmailChange}
            required
          />
          <Field label={t('add_to_contest.upbit_id')} value={ethAddress} onChange={this.handleUpbitChange} required />

          <Field label={`${t('global.eth_address')}`} placeholder="0x" value={ethAddress} onChange={this.handleEthAddressChange} required />
          <div className="terms">
            <span onClick={this.handleToggleTermsAndConditions}>
              <Radio defaultChecked={false} checked={contest.hasAcceptedTerms} label="" />
            </span>
            <span>
              {t('add_to_contest.i_accept_the')}
              <a href="https://decentraland.org/terms" rel="noopener noreferrer" target="_blank">
                {t('global.terms_and_conditions')}
              </a>
            </span>
          </div>
          {error ? (
            <div className="error">
              {t('add_to_contest.error_occurred')} "{error}"
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
    if (this.isSuccess) {
      return this.renderSuccess()
    }

    const { contest } = this.state
    const { name, isLoading, onClose } = this.props

    return (
      <Modal name={name}>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header>{t('add_to_contest.title')}</Modal.Header>
          <Modal.Content>{this.renderForm()}</Modal.Content>
          <Modal.Actions>
            {isLoading ? (
              <Loader size="large" />
            ) : (
              <>
                <Button primary disabled={!contest.hasAcceptedTerms}>
                  {t('global.submit')}
                </Button>
                <Button secondary onClick={preventDefault(onClose)}>
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
