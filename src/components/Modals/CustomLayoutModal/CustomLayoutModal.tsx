import * as React from 'react'
import { Button, ModalNavigation, Field } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import ProjectLayoutPicker from 'components/ProjectLayoutPicker'
import { fromLayout } from 'modules/template/utils'
import { ProjectLayout } from 'modules/project/types'
import { Props, SceneCreationStep, State } from './CustomLayoutModal.types'
import { SDKVersion } from 'modules/scene/types'
import webEditorSrc from 'images/web-editor-image.png'

export default class CustomLayoutModal extends React.PureComponent<Props, State> {
  state: State = {
    rows: 2,
    cols: 2,
    step: SceneCreationStep.INFO,
    hasError: false,
    name: t('global.new_scene'),
    description: ''
  }

  handleLayoutChange = (projectLayout: ProjectLayout) => {
    this.setState({ ...projectLayout })
  }

  handleGoBack = () => {
    const { step } = this.state
    switch (step) {
      case SceneCreationStep.SDK:
        this.setState({ step: SceneCreationStep.SIZE })
        break
      case SceneCreationStep.SIZE:
        this.setState({ step: SceneCreationStep.INFO })
        break
    }
  }

  handleCancel = () => {
    const { onClose } = this.props
    onClose()
  }

  handleSubmit = () => {
    const { onCreateProject, onClose } = this.props
    const { step, name, description, rows, cols } = this.state
    switch (step) {
      case SceneCreationStep.INFO:
        this.setState({ step: SceneCreationStep.SIZE })
        break
      case SceneCreationStep.SIZE:
        this.setState({ step: SceneCreationStep.SDK })
        break
      case SceneCreationStep.SDK:
        onCreateProject(name, description, fromLayout(rows, cols), SDKVersion.SDK7)
        onClose()
        break
    }
  }

  getSubtitle = () => {
    const { step } = this.state
    switch (step) {
      case SceneCreationStep.INFO:
        return t('create_modal.name_subtitle')
      case SceneCreationStep.SIZE:
        return t('create_modal.size_subtitle')
      case SceneCreationStep.SDK:
        return t('create_modal.sdk_subtitle')
    }
  }

  getSubmitButtonLabel = () => {
    const { step } = this.state
    switch (step) {
      case SceneCreationStep.INFO:
        return t('global.next')
      case SceneCreationStep.SIZE:
        return t('global.next')
      case SceneCreationStep.SDK:
        return t('global.create')
    }
  }

  getCancelButtonLabel = () => {
    const { step } = this.state
    switch (step) {
      case SceneCreationStep.INFO:
        return t('global.cancel')
      case SceneCreationStep.SIZE:
        return t('global.back')
      case SceneCreationStep.SDK:
        return t('global.back')
    }
  }

  renderModalContent = () => {
    const { step, description, rows, cols, name } = this.state
    if (step === SceneCreationStep.INFO) {
      return (
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
      )
    } else if (step === SceneCreationStep.SIZE) {
      return <ProjectLayoutPicker rows={rows} cols={cols} onChange={this.handleLayoutChange} showGrid />
    }

    return (
      <div>
        <img src={webEditorSrc} alt="new web editor" />
      </div>
    )
  }

  render() {
    const { name: modalName, onClose } = this.props
    const { name, hasError, step } = this.state

    return (
      <Modal name={modalName}>
        <ModalNavigation
          title={t('create_modal.title')}
          subtitle={this.getSubtitle()}
          onBack={step !== SceneCreationStep.INFO ? this.handleGoBack : undefined}
          onClose={onClose}
        />
        <Modal.Content>{this.renderModalContent()}</Modal.Content>
        <Modal.Actions>
          <Button secondary onClick={this.handleGoBack}>
            {this.getCancelButtonLabel()}
          </Button>
          <Button primary disabled={hasError || !name} onClick={this.handleSubmit}>
            {this.getSubmitButtonLabel()}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
