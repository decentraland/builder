import * as React from 'react'

import { getFace } from 'modules/profile/utils'
import { Props } from './AvatarFace.types'

import './AvatarFace.css'

export default class AvatarFace extends React.PureComponent<Props> {
  render() {
    const { profile, size } = this.props

    let face
    if (profile) {
      const url = getFace(profile)
      face = <img src={url} alt="" />
    } else {
      face = <div className="guest-face" />
    }

    return <div className={`AvatarFace ${size}`}>{face}</div>
  }
}
