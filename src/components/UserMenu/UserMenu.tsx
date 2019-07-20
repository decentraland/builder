import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button } from 'decentraland-ui'

import AvatarFace from '../AvatarFace'
// @ts-ignore
import addIcon from './add.svg'
// @ts-ignore
import switchIcon from './switch.svg'
// @ts-ignore
import signoutIcon from './signout.svg'
import { Props, State } from './UserMenu.types'

import './UserMenu.css'

export default class UserMenu extends React.Component<Props, State> {
  state: State = {
    isOpen: false
  }

  ref: HTMLElement | null = null

  handleClose = () => {
    setTimeout(() => this.setState({ isOpen: false }), 100)
  }

  handleToggle = () => {
    this.setState({ isOpen: !this.state.isOpen })
  }

  render() {
    const { face, name, email, isLoggedIn, isLoggingIn, onLogin, onLogout } = this.props
    const { isOpen } = this.state

    let classes = 'UserMenu'
    if (isLoggedIn) {
      classes += ' authed'
    }

    return (
      <div className={classes} onBlur={this.handleClose} tabIndex={0}>
        {isLoggedIn && (
          <>
            <div className="toggle" onClick={this.handleToggle}>
              <AvatarFace size="medium" face={face} />
            </div>
            <div className={`menu ${isOpen ? 'open' : ''}`}>
              <a className="info" href="https://avatars.decentraland.zone">
                <div className="image">
                  <AvatarFace size="small" face={face} />
                </div>
                <div>
                  <div className="name">{name || t('user_menu.guest')}</div>
                  <div className="email">{email}</div>
                </div>
              </a>
              <ul className="actions">
                <li onClick={onLogout}>
                  <i>
                    <img alt="logout" src={signoutIcon} />
                  </i>
                  {t('user_menu.sign_out')}
                </li>
              </ul>
            </div>
          </>
        )}
        {!isLoggedIn && (
          <Button primary disabled={isLoggingIn} onClick={onLogin}>
            {t('user_menu.sign_in')}
          </Button>
        )}
      </div>
    )
  }
}
