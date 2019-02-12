import * as React from 'react'
import { Modal, Field, Button, Form } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { MIN_TITLE_LENGTH, MAX_TITLE_LENGTH, MIN_DESCRIPTION_LENGTH, MAX_DESCRIPTION_LENGTH } from 'modules/project/utils'
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
    const { title, description } = this.state
    this.props.onSave(this.props.currentProject!.id, { title, description })
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
              <Field
                label={t('edit_project_modal.title_field_label')}
                value={title}
                placeholder={t('edit_project_modal.title_field_placeholder')}
                onChange={this.handleTitleChange}
                pattern={`.{${MIN_TITLE_LENGTH},${MAX_TITLE_LENGTH}}`}
                title={t('edit_project_modal.validation.title.length', {
                  min: MIN_TITLE_LENGTH,
                  max: MAX_TITLE_LENGTH
                })}
                required
              />
              <Field
                label={t('edit_project_modal.description_field_label')}
                value={description}
                placeholder={t('edit_project_modal.description_field_placeholder')}
                onChange={this.handleDescriptionChange}
                pattern={`.{${MIN_DESCRIPTION_LENGTH},${MAX_DESCRIPTION_LENGTH}}`}
                title={t('edit_project_modal.validation.description.length', {
                  min: MIN_DESCRIPTION_LENGTH,
                  max: MAX_DESCRIPTION_LENGTH
                })}
              />
            </div>

            <div className="button-container">
              <Button primary>{t('global.save')}</Button>
              <Button secondary onClick={this.handleOnClose}>
                {t('global.cancel')}
              </Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}
