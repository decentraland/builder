import * as React from 'react'
import { Button, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'

import { Props } from './LoginModal.types'

import './LoginModal.css'

export default class LoginModal extends React.PureComponent<Props, {}> {
  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  handleLogin = () => {
    if (this.props.onLogin) {
      this.props.onLogin()
    }
  }

  render() {
    const { name, title, subtitle, callToAction } = this.props

    return (
      <Modal name={name} onClose={this.handleClose}>
        <ModalNavigation title={title || ''} subtitle={subtitle} onClose={this.handleClose} />
        <div className="login-modal">
          <div className="modal-action">
            <Button primary size="small" onClick={this.handleLogin}>
              {callToAction}
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}
