import React from 'react'
import classNames from 'classnames'
import './SmartIcon.css'

export type SmartIconProps = {
  className?: string
}

export default class SmartIcon extends React.PureComponent<SmartIconProps> {
  static defaultProps = {
    className: ''
  }

  render() {
    const { className } = this.props
    return <div className={classNames('SmartIcon', className)} />
  }
}
