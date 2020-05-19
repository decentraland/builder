import { AvatarFace, Blockie } from 'decentraland-ui'
import * as React from 'react'
import { Props } from './Profile.types'
import './Profile.css'

export default class Profile extends React.PureComponent<Props> {
  componentWillMount() {
    const { avatar, address, onLoadProfile } = this.props
    if (!avatar) {
      onLoadProfile(address)
    }
  }

  render() {
    const { address, avatar, textOnly } = this.props
    const name = (avatar && avatar.name) || address.slice(0, 6)

    if (textOnly) {
      return name
    } else {
      return avatar ? (
        <span className="Profile avatar">
          <AvatarFace size="tiny" inline avatar={avatar} />
          <span className="name">{name}</span>
        </span>
      ) : (
        <span className="Profile blockie">
          <Blockie seed={address} scale={3} />
          <span className="name">{name}</span>
        </span>
      )
    }
  }
}
