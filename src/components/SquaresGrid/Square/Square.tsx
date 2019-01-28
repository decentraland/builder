import * as React from 'react'

import { Props } from './Square.types'
import './Square.css'

export default class Square extends React.PureComponent<Props> {
  static defaultProps = {
    className: '',
    size: 'medium'
  }

  render() {
    const { className, size } = this.props
    return <div className={`Square ${className} ${size}`} />
  }
}
