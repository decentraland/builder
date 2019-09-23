import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button } from 'decentraland-ui'

import AvatarFace from '../AvatarFace'
import { Props, State } from './UserMenu.types'

import './UserMenu.css'

export default class UserMenu extends React.Component<Props, State> {
  state: State = {
    isOpen: false
  }

  ref: HTMLElement | null = null

  handleClose = () => {
    this.setState({ isOpen: false })
  }

  handleToggle = () => {
    this.setState({ isOpen: !this.state.isOpen })
  }

  handleProfileClick = () => {
    // TODO: this should be part of decentraland-ui later on, that's why i'm not extracting this to a constant or something
    window.location.href = 'https://avatars.decentraland.org'
  }

  handleLogin = () => {
    const { onLogin } = this.props
    onLogin()
  }

  render() {
    const { user, isLoggedIn, isLoggingIn, onLogout } = this.props
    const { isOpen } = this.state

    let classes = 'UserMenu'
    if (isLoggedIn) {
      classes += ' authed'
    }

    let name = null
    let email = null
    if (user) {
      name = user.profile.name
      email = user.email
    }

    return (
      <div className={classes} onBlur={this.handleClose} tabIndex={0}>
        {isLoggedIn && (
          <>
            <div className="toggle" onClick={this.handleToggle}>
              <AvatarFace size="medium" user={user} />
            </div>
            <div className={`menu ${isOpen ? 'open' : ''}`}>
              <div className="info" onClick={this.handleProfileClick}>
                <div className="image">
                  <AvatarFace size="small" user={user} />
                </div>
                <div>
                  <div className="name">{name || t('user_menu.guest')}</div>
                  <div className="email">{email}</div>
                </div>
              </div>
              <ul className="actions">
                <li onClick={onLogout}>
                  <i className="sign-out-icon" />
                  {t('user_menu.sign_out')}
                </li>
              </ul>
            </div>
          </>
        )}
        {!isLoggedIn && (
          <Button primary disabled={isLoggingIn} onClick={this.handleLogin}>
            {t('user_menu.sign_in')}
          </Button>
        )}
      </div>
    )
  }
}
