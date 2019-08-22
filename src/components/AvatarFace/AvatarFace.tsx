import * as React from 'react'

import { bustCache } from './utils'
import { Props } from './AvatarFace.types'

import './AvatarFace.css'

export default class AvatarFace extends React.PureComponent<Props> {
  render() {
    const hasFace = this.props.face && this.props.face.length > 0

    return (
      <div className={`AvatarFace ${this.props.size}`}>
        {hasFace ? <img src={bustCache(this.props.face!)} alt="" /> : <div className="guest-face" />}
      </div>
    )
  }
}
