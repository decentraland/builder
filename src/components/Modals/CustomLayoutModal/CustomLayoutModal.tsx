import * as React from 'react'
import { Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import ProjectLayoutPicker from 'components/ProjectLayoutPicker'
import { fromLayout } from 'modules/template/utils'
import { ProjectLayout } from 'modules/project/types'
import { Props, State } from './CustomLayoutModal.types'

export default class CustomLayoutModal extends React.PureComponent<Props, State> {
  state = {
    rows: 2,
    cols: 4,
    hasError: false
  }

  handleLayoutChange = (projectLayout: ProjectLayout) => {
    this.setState({ ...projectLayout })
  }

  handleCreate = () => {
    const { rows, cols } = this.state
    const { onCreateProject, onClose } = this.props
    onCreateProject(fromLayout(rows, cols))
    onClose()
  }

  render() {
    const { name, onClose } = this.props
    const { rows, cols, hasError } = this.state

    return (
      <Modal name={name}>
        <Modal.Header>{t('templates.custom_layout.title')}</Modal.Header>
        <Modal.Description>
          <p>{t('custom_layout_modal.subtitle_one')}</p>
          <p>{t('custom_layout_modal.subtitle_two')}</p>
        </Modal.Description>
        <Modal.Content>
          <ProjectLayoutPicker rows={rows} cols={cols} onChange={this.handleLayoutChange} showGrid />
        </Modal.Content>
        <Modal.Actions>
          <Button secondary onClick={onClose}>
            {t('global.cancel')}
          </Button>
          <Button primary disabled={hasError} onClick={this.handleCreate}>
            {t('global.create')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
