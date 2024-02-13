import * as React from 'react'
import { ProviderType } from '@dcl/schemas'
import LoginModal from 'decentraland-dapps/dist/containers/LoginModal'
import { Props } from './WalletLoginModal.types'
import { redirectToAuthDapp } from 'routing/locations'

export default class WalletLoginModal extends React.PureComponent<Props> {
  handleClose = () => {
    const { onClose } = this.props
    if (onClose) {
      onClose()
    }
  }

  handleConnect = (providerType: ProviderType) => {
    this.props.onConnect(providerType)
  }

  componentDidMount(): void {
    redirectToAuthDapp()
  }

  componentDidUpdate(): void {
    redirectToAuthDapp()
  }

  render() {
    return <LoginModal name="LoginModal" open={true} onConnect={this.handleConnect} onClose={this.handleClose} />
  }
}
