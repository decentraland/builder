import * as React from 'react'
import { Button, ModalNavigation, Field } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import ProjectLayoutPicker from 'components/ProjectLayoutPicker'
import { fromLayout } from 'modules/template/utils'
import { ProjectLayout } from 'modules/project/types'
import { Props, State } from './CustomLayoutModal.types'

import './CustomLayoutModal.css'

export default class CustomLayoutModal extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()

  getInitialState() {
    const { metadata } = this.props

    if (metadata?.template) {
      return {
        name: metadata.template.title,
        description: metadata.template.description,
        rows: metadata.template.layout.rows,
        cols: metadata.template.layout.cols,
        setSize: false,
        hasError: false
      }
    }

    return {
      rows: 2,
      cols: 2,
      setSize: false,
      hasError: false,
      name: t('global.new_scene'),
      description: ''
    }
  }

  handleLayoutChange = (projectLayout: ProjectLayout) => {
    this.setState({ ...projectLayout })
  }

  handleCreate = () => {
    const { name, description, rows, cols } = this.state
    const { onCreateProject, onClose } = this.props
    onCreateProject(name, description, fromLayout(rows, cols))
    onClose()
  }

  handleCloneTemplate = () => {
    const { metadata, onDuplicate } = this.props
    const project = { ...metadata.template, title: this.state.name, description: this.state.description }
    onDuplicate(project)
  }

  renderCreateScene() {
    const { onClose: onCloseModal } = this.props
    const { rows, cols, name, description, setSize, hasError } = this.state

    let onCancel
    let onSubmit
    if (setSize) {
      onCancel = () => this.setState({ setSize: false })
      onSubmit = this.handleCreate
    } else {
      onCancel = onCloseModal
      onSubmit = () => this.setState({ setSize: true })
    }

    return (
      <>
        <Modal.Content>
          {setSize ? (
            <ProjectLayoutPicker rows={rows} cols={cols} onChange={this.handleLayoutChange} showGrid />
          ) : (
            <>
              <Field
                label={t('create_modal.name_label')}
                placeholder={t('global.new_scene')}
                value={name}
                onChange={(_event, props) => this.setState({ name: props.value })}
              />
              <Field
                label={t('create_modal.description_label')}
                placeholder={t('create_modal.description_placeholder')}
                value={description}
                onChange={(_event, props) => this.setState({ description: props.value })}
              />
            </>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button secondary onClick={onCancel}>
            {setSize ? t('global.back') : t('global.cancel')}
          </Button>
          <Button primary disabled={hasError || !name} onClick={onSubmit}>
            {setSize ? t('global.create') : t('global.next')}
          </Button>
        </Modal.Actions>
      </>
    )
  }

  renderCloneTemplate() {
    const { isLoading } = this.props
    const { name, description, hasError } = this.state
    return (
      <>
        <Modal.Content>
          <>
            <Field
              label={t('create_modal.name_label')}
              placeholder={t('global.new_scene')}
              value={name}
              onChange={(_event, props) => this.setState({ name: props.value })}
            />
            <Field
              label={t('create_modal.description_label')}
              placeholder={t('create_modal.description_placeholder')}
              value={description}
              onChange={(_event, props) => this.setState({ description: props.value })}
            />
          </>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            className="next-action-button"
            disabled={hasError || !name || isLoading}
            loading={isLoading}
            onClick={this.handleCloneTemplate}
          >
            {t('global.next')}
          </Button>
        </Modal.Actions>
      </>
    )
  }

  render() {
    const { name, metadata, onClose: onCloseModal } = this.props
    const { setSize } = this.state

    let onBack
    let onClose
    if (setSize) {
      onBack = () => this.setState({ setSize: false })
    } else {
      onClose = onCloseModal
    }

    return (
      <Modal name={name}>
        <ModalNavigation
          title={t('create_modal.title')}
          subtitle={setSize ? t('create_modal.size_subtitle') : t('create_modal.name_subtitle')}
          onBack={onBack}
          onClose={onClose}
        />
        {!metadata?.template ? this.renderCreateScene() : this.renderCloneTemplate()}
      </Modal>
    )
  }
}
