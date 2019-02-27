import * as React from 'react'
import { Button, Form } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import ProjectFields from 'components/ProjectFields'
import { Props, State } from './EditProjectModal.types'
import './EditProjectModal.css'

export default class EditProjectModal extends React.PureComponent<Props, State> {
  state = {
    title: this.props.currentProject ? this.props.currentProject.title : '',
    description: this.props.currentProject ? this.props.currentProject.description : ''
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.currentProject && nextProps.currentScene) {
      const { title, description } = nextProps.currentProject

      this.setState({ title, description })
    }
  }

  handleSubmit = () => {
    const { title, description } = this.state
    const { currentProject, onSave, onClose } = this.props
    if (currentProject) {
      onSave(currentProject.id, { title, description })
    }
    onClose()
  }

  handleTitleChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({ title: event.currentTarget.value })
  }

  handleDescriptionChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({ description: event.currentTarget.value })
  }

  render() {
    const { name, onClose } = this.props
    const { title, description } = this.state

    return (
      <Modal name={name}>
        <Modal.Content>
          <div className="title">{t('edit_project_modal.title')}</div>
          <Form onSubmit={this.handleSubmit}>
            <div className="details">
              <ProjectFields.Title value={title} onChange={this.handleTitleChange} required />
              <ProjectFields.Description value={description} onChange={this.handleDescriptionChange} />
            </div>

            <div className="buttons-container">
              <Button primary>{t('global.save')}</Button>
              <Button secondary onClick={onClose}>
                {t('global.cancel')}
              </Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}
