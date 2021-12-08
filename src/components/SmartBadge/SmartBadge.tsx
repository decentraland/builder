import { SmartIcon } from 'components/SmartIcon'
import React from 'react'
import './SmartBadge.css'

export type SmartBadgeProps = {
  className?: string
  size?: 'small' | 'normal'
}

export default class SmartBadge extends React.PureComponent<SmartBadgeProps> {
  static defaultProps = {
    className: '',
    size: 'normal'
  }

  render() {
    const { className, size } = this.props
    return (
      <div title="Smart Wearable" className={`SmartBadge ${className} ${size}`.trim()}>
        <SmartIcon />
      </div>
    )
  }
}
