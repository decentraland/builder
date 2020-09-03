import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'

import { Props } from './LoginModal.types'

import './LoginModal.css'

export default class LoginModal extends React.PureComponent<Props> {
  handleClose = () => {
    const { onClose } = this.props
    if (onClose) {
      onClose()
    }
  }

  handleLogin = () => {
    const { returnUrl, name, metadata, onLogin } = this.props
    if (onLogin) {
      onLogin({
        returnUrl: returnUrl || '',
        openModal: { name, metadata }
      })
    }
  }

  render() {
    const { name, title, subtitle } = this.props

    return (
      <Modal name={name} onClose={this.handleClose}>
        <ModalNavigation title={title || ''} subtitle={subtitle} onClose={this.handleClose} />
        <div className="login-modal">
          <div className="modal-action">
            <Button primary size="small" onClick={this.handleLogin}>
              {t('global.sign_in')}
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}
