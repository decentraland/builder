import * as React from 'react'
import { Modal, Field, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props, State } from './EditProjectModal.types'
import './EditProjectModal.css'

export default class EditProjectModal extends React.PureComponent<Props, State> {
  state = {
    title: this.props.currentProject.title,
    description: this.props.currentProject.description
  }

  handleOnClose = () => {
    const { modal, onClose } = this.props
    onClose(modal.name)
  }

  handleSubmit = () => {
    this.props.onSave(this.props.currentProject.id, { title: this.state.title, description: this.state.description })
    this.handleOnClose()
  }

  handleTitleChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      title: event.currentTarget.value
    })
  }

  handleDescriptionChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      description: event.currentTarget.value
    })
  }

  render() {
    const { modal } = this.props
    const { title, description } = this.state

    return (
      <Modal open={modal.open} className="ProjectDetailsModal" size="small" onClose={this.handleOnClose}>
        <Modal.Content>
          <div className="title">{t('project_details_modal.title')}</div>

          <div className="details">
            <Field label="Title" value={title} placeholder="Project title" onChange={this.handleTitleChange} />
            <Field label="Description" value={description} placeholder="No description" onChange={this.handleDescriptionChange} />
          </div>

          <div className="button-container">
            <Button primary onClick={this.handleSubmit}>
              Save
            </Button>
            <Button secondary onClick={this.handleOnClose}>
              Cancel
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}
