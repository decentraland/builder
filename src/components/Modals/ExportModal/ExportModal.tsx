import * as React from 'react'
import { Button } from 'decentraland-ui'
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
    const { name, onClose, isLoading, progress, total } = this.props

    let action = t('export_modal.action')
    if (total > 0) {
      action = `${t('export_modal.loading')} ${((progress / total) * 100).toFixed(0)}%`
    }

    return (
      <Modal name={name}>
        <Modal.Header>{t('export_modal.title')}</Modal.Header>
        <Modal.Content>
          <div className="details">{t('export_modal.description')}</div>
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.handleExport} disabled={isLoading}>
            {action}
          </Button>
          <Button secondary onClick={onClose} disabled={isLoading}>
            {t('global.cancel')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
