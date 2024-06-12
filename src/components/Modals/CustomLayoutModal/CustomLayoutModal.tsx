import * as React from 'react'
import { Button, ModalNavigation, Field } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import ProjectLayoutPicker from 'components/ProjectLayoutPicker'
import { fromLayout } from 'modules/template/utils'
import { ProjectLayout } from 'modules/project/types'
import { Props, SceneCreationStep, State } from './CustomLayoutModal.types'
import { SDKVersion } from 'modules/scene/types'
import webEditorSrc from 'images/web-editor-image.webp'
import styles from './CustomLayoutModal.module.css'
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

  handleBack = () => {
    const { step } = this.state
    switch (step) {
      // TODO: remove this after removing the SDK7_TEMPLATES feature flag
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

  handleNext = () => {
    const { step } = this.state
    if (step === SceneCreationStep.INFO) {
      this.setState({ step: SceneCreationStep.SIZE })
      // TODO: remove this after removing the SDK7_TEMPLATES feature flag
    } else if (step === SceneCreationStep.SIZE) {
      this.setState({ step: SceneCreationStep.SDK })
    }
  }

  handleSubmit = (sdk: SDKVersion) => {
    const { history, onCreateProject, onClose } = this.props
    const { name, description, rows, cols } = this.state
    onCreateProject(name, description, fromLayout(rows, cols), sdk, history)
    onClose()
  }

  getSubtitle = () => {
    const { step } = this.state
    switch (step) {
      case SceneCreationStep.INFO:
        return t('create_modal.name_subtitle')
      case SceneCreationStep.SIZE:
        return t('create_modal.size_subtitle')
      // TODO: remove this after removing the SDK7_TEMPLATES feature flag
      case SceneCreationStep.SDK:
        return t('create_modal.sdk_subtitle')
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
      <div className={styles.sdkContent}>
        <span className={styles.sdkDescription}>{t('create_modal.sdk_description', { b: (str: string) => <b>{str}</b> })}</span>
        <img className={styles.sdkImg} src={webEditorSrc} alt={t('create_modal.sdk_image_alt')} />
      </div>
    )
  }

  renderModalActions = () => {
    const { isCreateSceneOnlySDK7Enabled } = this.props
    const { hasError, name, step } = this.state

    switch (step) {
      case SceneCreationStep.INFO:
        return (
          <div className={styles.actionsContainer}>
            <Button secondary onClick={this.handleCancel}>
              {t('global.cancel')}
            </Button>
            <Button primary disabled={hasError || !name} onClick={this.handleNext}>
              {t('global.next')}
            </Button>
          </div>
        )
      case SceneCreationStep.SIZE:
        return (
          <div className={styles.actionsContainer}>
            <Button secondary onClick={this.handleBack}>
              {t('global.back')}
            </Button>
            <Button
              primary
              disabled={hasError || !name}
              onClick={isCreateSceneOnlySDK7Enabled ? this.handleSubmit.bind(this, SDKVersion.SDK7) : this.handleNext}
            >
              {t('global.next')}
            </Button>
          </div>
        )
      // TODO: remove this after removing the SDK7_TEMPLATES feature flag
      case SceneCreationStep.SDK:
        return (
          <div className={styles.sdkActionContainer}>
            <Button secondary onClick={this.handleSubmit.bind(this, SDKVersion.SDK6)}>
              {t('create_modal.use_sdk6')}
            </Button>
            <Button primary onClick={this.handleSubmit.bind(this, SDKVersion.SDK7)}>
              {t('create_modal.use_sdk7')}
            </Button>
          </div>
        )
    }
  }

  render() {
    const { name: modalName, onClose } = this.props
    const { step } = this.state

    return (
      <Modal name={modalName}>
        <ModalNavigation
          // TODO: remove this after removing the SDK7_TEMPLATES feature flag
          title={step !== SceneCreationStep.SDK ? t('create_modal.title') : t('create_modal.sdk_title')}
          subtitle={this.getSubtitle()}
          onBack={step !== SceneCreationStep.INFO ? this.handleBack : undefined}
          onClose={onClose}
        />
        <Modal.Content>{this.renderModalContent()}</Modal.Content>
        <Modal.Actions>{this.renderModalActions()}</Modal.Actions>
      </Modal>
    )
  }
}
