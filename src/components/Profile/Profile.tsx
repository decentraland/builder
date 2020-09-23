import * as React from 'react'
import { AvatarFace, Blockie, Logo } from 'decentraland-ui'
import { isEqual } from 'lib/address'
import { LAND_POOL_ADDRESS } from 'modules/land/utils'
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
    const { address, avatar, textOnly, imageOnly, avatarOnly, blockieOnly, size } = this.props
    const name = (avatar && avatar.name) || address.slice(0, 6)

    if (isEqual(address, LAND_POOL_ADDRESS)) {
      return (
        <span className={`Profile decentraland ${size}`} title={address}>
          <Logo />
          {imageOnly ? null : <span className="name">Decentraland</span>}
        </span>
      )
    }

    if (textOnly) {
      return name
    } else {
      return avatar ? (
        <span className={`Profile avatar ${size}`} title={address}>
          <AvatarFace size="tiny" inline avatar={avatar} />
          {avatarOnly || imageOnly ? null : <span className="name">{name}</span>}
        </span>
      ) : (
        <span className={`Profile blockie ${size}`} title={address}>
          <Blockie seed={address} scale={size === 'large' ? 5 : size === 'huge' ? 7 : 3} />
          {blockieOnly || imageOnly ? null : <span className="name">{name}</span>}
        </span>
      )
    }
  }
}
