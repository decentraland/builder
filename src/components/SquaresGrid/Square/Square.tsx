import * as React from 'react'

import { Props, DefaultProps } from './Square.types'
import './Square.css'

export default class Square extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    className: '',
    size: 'medium'
  }

  render() {
    const { className, size } = this.props
    return <div className={`Square ${className} ${size}`} />
  }
}
