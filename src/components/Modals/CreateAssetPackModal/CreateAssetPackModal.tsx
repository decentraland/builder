import * as React from 'react'
import { Close } from 'decentraland-ui'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import AssetImport from 'components/AssetImport'

import './CreateAssetPackModal.css'

export default class CreateAssetPackModal extends React.PureComponent<ModalProps> {
  render() {
    const { name, onClose } = this.props

    return (
      <Modal name={name} closeIcon={<Close onClick={onClose} />}>
        <Modal.Header>Alto asset pack</Modal.Header>
        <Modal.Content>
          <AssetImport
            onAssetPack={a => {
              console.log(a)
            }}
          />
        </Modal.Content>
      </Modal>
    )
  }
}
