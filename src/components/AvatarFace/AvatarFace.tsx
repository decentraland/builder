import * as React from 'react'

import { bustCache } from './utils'
import { Props } from './AvatarFace.types'
// @ts-ignore
import guestFace from './guest.svg'

import './AvatarFace.css'

export default class AvatarFace extends React.PureComponent<Props> {
  render() {
    const hasFace = this.props.face && this.props.face.length > 0

    return (
      <div className={`AvatarFace ${this.props.size}`}>
        <img src={bustCache(hasFace ? this.props.face : guestFace)} alt="" />
      </div>
    )
  }
}
