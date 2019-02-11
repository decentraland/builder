import * as React from 'react'
import { Form, Modal, Header, Field, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import ProjectFields from 'components/ProjectFields'
import { Props, State } from './SubmitProjectModal.types'
import './SubmitProjectModal.css'

export default class SubmitProjectModal extends React.PureComponent<Props, State> {
  state = {
    project: {
      title: this.props.currentProject.title,
      description: this.props.currentProject.description
    },

    contest: {
      email: this.props.contest.email,
      ethAddress: this.props.contest.ethAddress
    }
  }

  handleClose = () => {
    const { modal, onClose } = this.props
    onClose(modal.name)
  }

  handleSubmit = () => {
    const { currentProject, onSaveProject, onSubmitProject } = this.props
    const { project, contest } = this.state

    onSaveProject(currentProject.id, project)
    onSubmitProject(currentProject.id, contest)

    this.handleClose()
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

  render() {
    const { modal } = this.props
    const { project, contest } = this.state
    const { title, description } = project
    const { email, ethAddress } = contest

    return (
      <Modal open={modal.open} className="SubmitProjectModal" size="small" onClose={this.handleClose}>
        <Modal.Content>
          <Header size="huge">{t('submit_project_modal.title')}</Header>
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
              <Button secondary onClick={this.handleClose}>
                {t('global.cancel')}
              </Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}
