import * as React from 'react'
import { Button, Close, Icon, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'

import { Props } from './ExportModal.types'
import './ExportModal.css'

export default class ExportModal extends React.PureComponent<Props> {
  handleExport = () => {
    const { metadata, onExport } = this.props
    if (metadata) {
      onExport(metadata.project)
    }
  }

  render() {
    const { name, onClose, isLoading, progress, total, isTemplatesEnabled, metadata } = this.props

    let action = isTemplatesEnabled ? t('export_modal.action') : t('export_modal.old.action')
    if (total > 0) {
      action = `${t('export_modal.loading')} ${((progress / total) * 100).toFixed(0)}%`
    }

    return (
      <Modal name={name} closeIcon={<Close />} onClose={onClose}>
        <Modal.Header className="export-modal-title">{t('export_modal.title')}</Modal.Header>
        <Modal.Content>
          <div className="export-modal-content-image" />
          <span className="details">{t('export_modal.description')}</span>
        </Modal.Content>
        <Modal.Actions className="export-modal-actions">
          <Button primary onClick={this.handleExport} disabled={isLoading || !metadata.project}>
            <Icon name="download" />
            {action}
            {isLoading && <Loader active size="tiny" inline className="export-modal-loader" />}
          </Button>
          <Button as="a" secondary href="https://developers.decentraland.org" rel="noopener noreferrer" target="_blank">
            {t('export_modal.docs')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
