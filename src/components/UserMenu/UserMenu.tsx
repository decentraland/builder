import * as React from 'react'
import { UserMenu as BaseUserMenu } from 'decentraland-ui'
import { Props, State } from './UserMenu.types'

export default class UserMenu extends React.Component<Props, State> {
  render() {
    const { profile, mana, onLogout } = this.props
    return <BaseUserMenu mana={mana} isSignedIn onSignOut={onLogout} avatar={profile ? profile.avatars[0] : undefined} />
  }
}
