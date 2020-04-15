import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Mana } from 'decentraland-ui'

import AvatarFace from '../AvatarFace'
import { Props, State } from './UserMenu.types'

import './UserMenu.css'
import { getName } from 'modules/profile/utils'

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
    const { profile, mana, isLoggedIn, isLoggingIn, onLogout } = this.props
    const { isOpen } = this.state

    const name = profile ? getName(profile) : null

    return (
      <div className="UserMenu" onBlur={this.handleClose} tabIndex={0}>
        {isLoggedIn && (
          <>
            <span className="dcl account-wrapper">
              {mana ? (
                <Mana size="small" title={`${mana.toLocaleString()} MANA`}>
                  {parseInt(mana.toFixed(0), 10).toLocaleString()}
                </Mana>
              ) : null}
            </span>
            <div className="toggle" onClick={this.handleToggle}>
              <AvatarFace size="medium" profile={profile} />
            </div>
            <div className={`menu ${isOpen ? 'open' : ''}`}>
              <div className="info" onClick={this.handleProfileClick}>
                <div className="image">
                  <AvatarFace size="small" profile={profile} />
                </div>
                <div>
                  <div className="name">{name || t('user_menu.guest')}</div>
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
