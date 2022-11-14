import * as React from 'react'
import classNames from 'classnames'
import { Props, DefaultProps } from './Square.types'
import './Square.css'

export default class Square extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    className: '',
    size: 'medium'
  }

  render() {
    const { className, size } = this.props
    return <div className={classNames('Square', className, size)} />
  }
}
