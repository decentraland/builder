import * as React from 'react'
import { Form, Modal, Field, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import ProjectFields from 'components/ProjectFields'
import { preventDefault } from 'lib/preventDefault'
import { Props, State } from './AddToContestModal.types'
import './AddToContestModal.css'

export default class AddToContestModal extends React.PureComponent<Props, State> {
  state = this.getBaseState()

  handleOnCancel = () => {
    this.closeModal()
    this.setState(this.getBaseState())
  }

  handleSubmit = () => {
    const { currentProject, onSaveProject, onSubmitProject } = this.props
    const { project, contest } = this.state
    const projectId = currentProject!.id

    onSaveProject(projectId, project)
    onSubmitProject(projectId, contest)

    this.closeModal()
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

  closeModal() {
    this.props.onClose('AddToContestModal')
  }

  render() {
    const { modal } = this.props
    const { project, contest } = this.state
    const { title, description } = project
    const { email, ethAddress } = contest

    return (
      <Modal open={modal.open} className="AddToContestModal" size="small" onClose={this.handleOnCancel}>
        <Modal.Content>
          <div className="title">{t('submit_project_modal.title')}</div>
          <div className="subtitle">{t('submit_project_modal.subtitle')}</div>

          <Form onSubmit={this.handleSubmit}>
            <div className="details">
              <div className="category">{t('global.project')}</div>
              <ProjectFields.Title value={title} onChange={this.handleTitleChange} required />
              <ProjectFields.Description value={description} onChange={this.handleDescriptionChange} />
            </div>

            <div className="details">
              <div className="category">{t('submit_project_modal.contact_information')}</div>
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

            <div className="buttons-container">
              <Button primary>{t('global.submit')}</Button>
              <Button secondary onClick={preventDefault(this.handleOnCancel)}>
                {t('global.cancel')}
              </Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}
