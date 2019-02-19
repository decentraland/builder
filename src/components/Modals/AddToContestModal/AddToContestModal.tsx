import * as React from 'react'
import { Form, Field, Button, Loader } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

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

  handleSubmit = () => {
    const { currentProject, onSaveProject, onSubmitProject } = this.props
    const { project, contest } = this.state
    const projectId = currentProject!.id

    this.isSubmitting = true

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

  getBaseState(): State {
    return {
      project: { ...this.props.currentProject! },
      contest: { ...this.props.contest }
    }
  }

  render() {
    const { name, isLoading, error, onClose } = this.props
    const { project, contest } = this.state
    const { title, description } = project
    const { email, ethAddress } = contest

    return (
      <Modal name={name}>
        <Modal.Content>
          <div className="title">{t('add_to_contest.title')}</div>
          <div className="subtitle">{t('add_to_contest.subtitle')}</div>

          <Form onSubmit={this.handleSubmit}>
            <div className="details">
              <div className="category">{t('global.project')}</div>
              <ProjectFields.Title value={title} onChange={this.handleTitleChange} required />
              <ProjectFields.Description value={description} onChange={this.handleDescriptionChange} />
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
              <Field label={t('global.eth_address')} placeholder="0x" value={ethAddress} onChange={this.handleEthAddressChange} />
            </div>

            {error ? (
              <div className="error">
                {t('add_to_contest.error_occurred')} "{error}"
              </div>
            ) : null}

            {isLoading ? (
              <div className="loading-container">
                <Loader size="large" />
              </div>
            ) : (
              <div className="buttons-container">
                {this.isSuccess ? <Button primary icon="check" disabled={true} /> : <Button primary>{t('global.submit')}</Button>}
                <Button secondary onClick={preventDefault(onClose)}>
                  {t('global.cancel')}
                </Button>
              </div>
            )}
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}
