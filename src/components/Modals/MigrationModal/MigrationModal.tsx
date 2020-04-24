import * as React from 'react'
import { Close, Button } from 'decentraland-ui'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Auth0MigrationResult } from 'modules/auth/types'

export default class MigrationModal extends React.PureComponent<ModalProps> {
  render() {
    const { name, metadata, onClose } = this.props

    const result = metadata as Auth0MigrationResult

    return (
      <Modal name={name} closeIcon={<Close onClick={onClose} />}>
        <Modal.Header>{t('home_page.migration_modal_title')}</Modal.Header>
        <Modal.Content>
          <p>{t('home_page.migration_modal_message')}</p>
          <ul>
            <li>Scenes: {result.projects}</li>
            <li>Asset packs: {result.assetPacks}</li>
            <li>Deployments: {result.deployments}</li>
            <li>Scene pool entries: {result.pools}</li>
            <li>Scene pool likes: {result.likes}</li>
          </ul>
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={onClose}>
            {t('home_page.migration_modal_dismiss')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
