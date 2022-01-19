import React from 'react'
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
    return <div className={`SmartIcon ${className}`.trim()} />
  }
}
