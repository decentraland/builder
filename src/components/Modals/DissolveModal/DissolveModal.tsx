import * as React from 'react'
import { Button, ModalContent, ModalActions, ModalHeader } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props } from './DissolveModal.types'

export default class DissolveModal extends React.PureComponent<Props> {
  handleConfirm = () => {
    const { metadata, onDissolve } = this.props
    onDissolve(metadata.land)
  }

  render() {
    const { name, metadata, onClose } = this.props
    const { land } = metadata

    return (
      <Modal name={name} onClose={onClose}>
        <ModalHeader>{t('dissolve_modal.title')}</ModalHeader>
        <ModalContent>
          <T id="dissolve_modal.confirm" values={{ name: <strong>{land.name}</strong> }} />
        </ModalContent>
        <ModalActions>
          <Button onClick={onClose}>{t('global.cancel')}</Button>
          <Button primary onClick={this.handleConfirm}>
            {t('global.confirm')}
          </Button>
        </ModalActions>
      </Modal>
    )
  }
}
