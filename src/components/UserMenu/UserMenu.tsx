import * as React from 'react'
import { UserMenu as BaseUserMenu, Row, Menu, Icon } from 'decentraland-ui'
import { locations } from 'routing/locations'
import { Props, State } from './UserMenu.types'
import './UserMenu.css'

export default class UserMenu extends React.Component<Props, State> {
  render() {
    const { profile, mana, onLogout, pathname, hasPendingTransactions, onNavigate } = this.props
    return (
      <Row>
        <Menu.Item className={pathname === locations.activity() ? 'activity active' : 'activity'}>
          <Icon className={hasPendingTransactions ? 'pending' : ''} name="bell" onClick={() => onNavigate(locations.activity())} />
        </Menu.Item>
        <BaseUserMenu mana={mana} isSignedIn onSignOut={onLogout} avatar={profile ? profile.avatars[0] : undefined} />
      </Row>
    )
  }
}
