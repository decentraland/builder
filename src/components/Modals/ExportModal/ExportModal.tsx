import * as React from 'react'
import { Button, Checkbox, Close, Icon, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'

import { Props } from './ExportModal.types'
import './ExportModal.css'

export default class ExportModal extends React.PureComponent<Props, { migrateToSDK7: boolean }> {
  state = { migrateToSDK7: false }

  handleExport = () => {
    const { metadata, onExport } = this.props
    if (metadata) {
      onExport(metadata.project, this.state.migrateToSDK7)
    }
  }

  render() {
    const { name, onClose, isLoading, isSDK6, progress, total, metadata } = this.props

    let action = t('export_modal.action')
    if (total > 0) {
      action = `${t('export_modal.loading')} ${((progress / total) * 100).toFixed(0)}%`
    }

    return (
      <Modal name={name} closeIcon={<Close />} onClose={onClose}>
        <Modal.Header className="export-modal-title">{t('export_modal.title')}</Modal.Header>
        <Modal.Content>
          <div className="export-modal-content-image" />
          <span className="details">{t('export_modal.description')}</span>
          {isSDK6 && (
            <Checkbox
              className="export-modal-convert"
              disabled={isLoading}
              checked={this.state.migrateToSDK7}
              label={t('export_modal.convert_to_sdk7')}
              onChange={(_, { checked }) => this.setState({ migrateToSDK7: !!checked })}
            />
          )}
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
