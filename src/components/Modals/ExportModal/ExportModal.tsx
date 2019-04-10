import * as React from 'react'
import { Button, Close } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'

import { Props } from './ExportModal.types'
import './ExportModal.css'

export default class ExportModal extends React.PureComponent<Props> {
  handleExport = () => {
    const { metadata, onExport, onClose } = this.props
    onExport(metadata.project)
    onClose()
  }

  render() {
    const { name, onClose } = this.props

    return (
      <Modal name={name} closeIcon={<Close onClick={onClose} />}>
        <Modal.Header>{t('export_modal.title')}</Modal.Header>
        <Modal.Content>
          <div className="details">{t('export_modal.description')}</div>
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.handleExport}>
            {t('export_modal.action')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
