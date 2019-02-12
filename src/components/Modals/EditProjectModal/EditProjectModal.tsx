import * as React from 'react'
import { Modal, Field, Button, Form, Header } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { MIN_TITLE_LENGTH, MAX_TITLE_LENGTH, MIN_DESCRIPTION_LENGTH, MAX_DESCRIPTION_LENGTH } from 'modules/project/utils'
import GroundPicker from './GroundPicker/GroundPicker'
import { Props, State } from './EditProjectModal.types'
import './EditProjectModal.css'

export default class EditProjectModal extends React.PureComponent<Props, State> {
  state = {
    title: this.props.currentProject ? this.props.currentProject.title : '',
    description: this.props.currentProject ? this.props.currentProject.description : '',
    selectedGround: this.props.currentScene && this.props.currentScene.ground ? this.props.currentScene.ground.assetId : null
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!this.props.modal.open && nextProps.modal.open && nextProps.currentProject && nextProps.currentScene) {
      const { title, description } = nextProps.currentProject
      let ground = null

      if (nextProps.currentScene.ground) {
        ground = nextProps.currentScene.ground.assetId || null
      }

      this.setState({ title, description, selectedGround: ground })
    }
  }

  handleOnClose = () => {
    this.props.onClose('EditProjectModal')
  }

  handleSubmit = () => {
    const { title, description, selectedGround } = this.state
    const { currentProject, grounds } = this.props
    const ground = selectedGround ? grounds[selectedGround] : null
    if (currentProject) {
      this.props.onSave(currentProject.id, { title, description })
      this.props.onSetGround(currentProject, ground)
    }
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

  handlePickGround = (id: string | null) => {
    this.setState({
      selectedGround: id
    })
  }

  render() {
    const { modal, grounds } = this.props
    const { title, description, selectedGround } = this.state

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

              <Header sub className="custom-label">
                {t('edit_project_modal.ground_label')}
              </Header>

              <GroundPicker grounds={grounds} selectedGround={selectedGround} onClick={this.handlePickGround} />
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
