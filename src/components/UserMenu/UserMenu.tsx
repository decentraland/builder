import * as React from 'react'
import { default as BaseUserMenu } from 'decentraland-dapps/dist/containers/UserMenu'
import { Row, Menu, Icon } from 'decentraland-ui'
import { locations } from 'routing/locations'
import { Props, State } from './UserMenu.types'
import './UserMenu.css'

export default class UserMenu extends React.Component<Props, State> {
  render() {
    const { profile, onLogout, pathname, hasPendingTransactions, onNavigate } = this.props
    return (
      <Row>
        <Menu.Item className={pathname === locations.activity() ? 'activity active' : 'activity'}>
          <Icon className={hasPendingTransactions ? 'pending' : ''} name="bell" onClick={() => onNavigate(locations.activity())} />
        </Menu.Item>
        <BaseUserMenu
          onClickSettings={() => onNavigate(locations.settings())}
          isSignedIn
          onSignOut={onLogout}
          avatar={profile ? profile.avatars[0] : undefined}
        />
      </Row>
    )
  }
}
