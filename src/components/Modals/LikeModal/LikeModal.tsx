import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import LoginModal from '../LoginModal'
import { Props } from './LikeModal.types'

import './LikeModal.css'

export default class LikeModal extends React.PureComponent<Props> {
  handleLogin = () => {
    const { onLogin } = this.props
    onLogin()
  }

  render() {
    const { name, isLoggedIn, onClose } = this.props

    if (isLoggedIn) {
      onClose()
    }

    return (
      <LoginModal
        name={name}
        title={t('like_modal.sign_in.title')}
        subtitle={t('like_modal.sign_in.subtitle')}
        onClose={onClose}
        onLogin={this.handleLogin}
      />
    )
  }
}
