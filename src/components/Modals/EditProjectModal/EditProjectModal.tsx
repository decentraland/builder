import * as React from 'react'
import { Modal, Button, Form } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import ProjectFields from 'components/ProjectFields'
import { Props, State } from './EditProjectModal.types'
import './EditProjectModal.css'

export default class EditProjectModal extends React.PureComponent<Props, State> {
  state = {
    title: this.props.currentProject.title,
    description: this.props.currentProject.description
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!this.props.modal.open && nextProps.modal.open) {
      const { title, description } = nextProps.currentProject
      this.setState({ title, description })
    }
  }

  handleOnClose = () => {
    this.props.onClose('EditProjectModal')
  }

  handleSubmit = () => {
    const { currentProject, onSave } = this.props
    const { title, description } = this.state
    onSave(currentProject!.id, { title, description })
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
          <div className="title">{t('edit_project_modal.title')}</div>
          <Form onSubmit={this.handleSubmit}>
            <div className="details">
              <ProjectFields.Title value={title} onChange={this.handleTitleChange} required />
              <ProjectFields.Description value={description} onChange={this.handleDescriptionChange} />
            </div>
            <div className="buttons-container">
              <div className="button-container">
                <Button primary>{t('global.save')}</Button>
                <Button secondary onClick={this.handleOnClose}>
                  {t('global.cancel')}
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}
