import * as React from 'react'

import WalletLoginModal from '../WalletLoginModal'
import { Props } from './LikeModal.types'

import './LikeModal.css'

export default class LikeModal extends React.PureComponent<Props> {
  render() {
    const { name, isLoggedIn, onClose } = this.props

    if (isLoggedIn) {
      onClose()
    }

    return <WalletLoginModal name={name} onClose={onClose} />
  }
}
