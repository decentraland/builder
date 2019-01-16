import * as React from 'react'

import { Props } from './Icon.types'
import './Icon.css'

export default class Icon extends React.PureComponent<Props> {
  static defaultProps = {
    isActive: false
  }

  render() {
    const { name, isActive } = this.props
    return <div className={`Icon ${name} ${isActive ? 'active' : ''}`}>{name}</div>
  }
}
