import * as React from 'react'
import { Button, ModalNavigation, Field } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import ProjectLayoutPicker from 'components/ProjectLayoutPicker'
import { fromLayout } from 'modules/template/utils'
import { ProjectLayout } from 'modules/project/types'
import { Props, State } from './CustomLayoutModal.types'

export default class CustomLayoutModal extends React.PureComponent<Props, State> {
  state = {
    rows: 2,
    cols: 2,
    setSize: false,
    hasError: false,
    name: t('global.new_scene'),
    description: ''
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

  render() {
    const { name: modalName, onClose: onCloseModal } = this.props
    const { rows, cols, name, description, setSize, hasError } = this.state

    let onClose
    let onBack
    let onCancel
    let onSubmit
    if (setSize) {
      onCancel = onBack = () => this.setState({ setSize: false })
      onSubmit = this.handleCreate
    } else {
      onCancel = onClose = onCloseModal
      onSubmit = () => this.setState({ setSize: true })
    }

    return (
      <Modal name={modalName}>
        <ModalNavigation
          title={t('create_modal.title')}
          subtitle={setSize ? t('create_modal.size_subtitle') : t('create_modal.name_subtitle')}
          onBack={onBack}
          onClose={onClose}
        />
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
      </Modal>
    )
  }
}
