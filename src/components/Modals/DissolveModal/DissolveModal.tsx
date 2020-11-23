import * as React from 'react'
import { Button, ModalContent, ModalActions, ModalHeader } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import { MAX_PARCELS_PER_TX } from 'modules/land/utils'
import { Props } from './DissolveModal.types'

export default class DissolveModal extends React.PureComponent<Props, {}> {
  handleConfirm = () => {
    const { metadata, onDissolve } = this.props
    onDissolve(metadata.land)
  }

  render() {
    const { name, metadata, onClose } = this.props
    const { land } = metadata

    const isTooBig = land.parcels!.length > MAX_PARCELS_PER_TX

    return (
      <Modal name={name} onClose={onClose}>
        <ModalHeader>{t('dissolve_modal.title')}</ModalHeader>
        <ModalContent>
          {isTooBig ? (
            <T id="dissolve_modal.too_big" values={{ max: MAX_PARCELS_PER_TX }} />
          ) : (
            <T id="dissolve_modal.confirm" values={{ name: <strong>{land.name}</strong> }} />
          )}
        </ModalContent>
        <ModalActions>
          <Button onClick={onClose}>{t('global.cancel')}</Button>
          <Button primary onClick={this.handleConfirm} disabled={isTooBig}>
            {t('global.confirm')}
          </Button>
        </ModalActions>
      </Modal>
    )
  }
}
