import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import LoginModal from '../LoginModal'
import { Props, State } from './LikeModal.types'

import './LikeModal.css'

export default class LikeModal extends React.PureComponent<Props, State> {
  state: State = {}

  input = React.createRef<HTMLInputElement>()

  handleLogin = () => {
    const { onLogin } = this.props
    onLogin()
  }

  render() {
    const { name } = this.props

    return (
      <LoginModal
        name={name}
        title={t('like_modal.sign_in.title')}
        subtitle={t('like_modal.sign_in.subtitle')}
        callToAction={t('global.sign_in')}
        onClose={this.props.onClose}
        onLogin={this.handleLogin}
      />
    )
  }
}
