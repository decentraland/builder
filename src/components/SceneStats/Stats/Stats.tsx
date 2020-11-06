import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { Props } from './Stats.types'
import './Stats.css'

export default class Stats extends React.PureComponent<Props> {
  render() {
    const { stats, isLoading, label, children } = this.props
    const value = isLoading && !stats ? <Loader active size="mini" /> : children(stats)
    return (
      <div className="Stats">
        <div className="value">{value}</div>
        <div className="label">{label}</div>
      </div>
    )
  }
}
