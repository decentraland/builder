import React from 'react'
import { Modal } from 'decentraland-dapps/dist/containers'
import { Button, ModalActions, ModalNavigation } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, DeployEntitiesModalView } from './DeployEntitiesModal.types'
import './DeployEntitiesModal.css'

export default class DeployEntitiesModal extends React.PureComponent<Props> {
  handleClose = () => {
    const { onClose } = this.props
    onClose()
  }

  renderModalTitle() {
    const { view } = this.props.metadata
    return view === DeployEntitiesModalView.SUCCESS ? t('deploy_entities_modal.success_title') : t('deploy_entities_modal.error_title')
  }

  renderModalContent() {
    const { view, error, collection } = this.props.metadata

    return (
      <Modal.Content>
        <div className="modal-content">
          {view === DeployEntitiesModalView.SUCCESS ? (
            <div className="success-message">
              <p>{t('deploy_entities_modal.success_message', { name: collection.name, b: (text: string) => <b>{text}</b> })}</p>
            </div>
          ) : (
            <div className="error-message">
              <p>{t('deploy_entities_modal.error_message', { name: collection.name, b: (text: string) => <b>{text}</b> })}</p>
              {error && <p className="error-details">{error}</p>}
            </div>
          )}
        </div>
      </Modal.Content>
    )
  }

  renderModalActions() {
    return (
      <ModalActions>
        <Button className="done-button" primary onClick={this.handleClose}>
          {t('global.done')}
        </Button>
      </ModalActions>
    )
  }

  render() {
    const { view } = this.props.metadata

    if (!view) {
      return null
    }

    return (
      <Modal open size="small" className="DeployEntitiesModal">
        <ModalNavigation title={this.renderModalTitle()} onClose={this.handleClose} />
        {this.renderModalContent()}
        {this.renderModalActions()}
      </Modal>
    )
  }
}
