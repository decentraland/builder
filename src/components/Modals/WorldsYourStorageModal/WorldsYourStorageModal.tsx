import * as React from 'react'
import { Props } from './WorldsYourStorageModal.types'
import { Modal } from 'decentraland-ui'

export default class WalletLoginModal extends React.PureComponent<Props> {
  render() {
    const { name, onClose } = this.props
    return (
      <Modal name={name} onClose={onClose} size="tiny" closeOnDimmerClick={false}>
        HOLA
      </Modal>
    )
  }
}
