import * as React from 'react'

import { Props } from './AvatarFace.types'

import './AvatarFace.css'

export default class AvatarFace extends React.PureComponent<Props> {
  render() {
    const { user } = this.props

    let face
    if (user) {
      const url = user.snapshots.face + '?updated_at=' + user.updatedAt
      face = <img src={url} alt="" />
    } else {
      face = <div className="guest-face" />
    }

    return <div className={`AvatarFace ${this.props.size}`}>{face}</div>
  }
}
