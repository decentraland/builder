import * as React from 'react'
import { Props } from './Stats.types'
import './Stats.css'

export default class Stats extends React.PureComponent<Props> {
  render() {
    const { label, children } = this.props
    return (
      <div className="Stats">
        <div className="label">{label}</div>
        <div className="value">{children}</div>
      </div>
    )
  }
}
