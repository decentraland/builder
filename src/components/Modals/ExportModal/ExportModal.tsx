import * as React from 'react'
import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'

import { Props } from './ExportModal.types'
import './ExportModal.css'

export default class ExportModal extends React.PureComponent<Props> {
  handleExport = () => {
    const { metadata, onExport, onClose } = this.props
    if (metadata) {
      onExport(metadata.project)
    }
    onClose()
  }

  render() {
    const { name, onClose } = this.props

    return (
      <Modal name={name}>
        <Modal.Header>{t('export_modal.title')}</Modal.Header>
        <Modal.Content>
          <div className="details">{t('export_modal.description')}</div>
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.handleExport}>
            {t('export_modal.action')}
          </Button>
          <Button secondary onClick={onClose}>
            {t('global.cancel')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
