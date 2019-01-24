import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import SquaresGrid from 'components/SquareGrid'
import { SceneMetrics } from 'modules/scene/types'
import { Props, State } from './Metrics.types'
import './Metrics.css'

export default class Metrics extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      toggle: false
    }
  }

  componentWillMount() {
    document.addEventListener('click', this.handleClose)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClose)
  }

  handleToggle = () => {
    this.setState({
      toggle: !this.state.toggle
    })
  }

  handleClose = () => {
    this.setState({
      toggle: false
    })
  }

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.nativeEvent.stopImmediatePropagation()
  }

  renderMetrics() {
    return Object.keys(this.props.metrics).map(key => this.renderMetric(key as keyof SceneMetrics))
  }

  renderMetric(metric: keyof SceneMetrics) {
    const { metrics, limits } = this.props
    let classes = 'metric'
    if (metrics[metric] > limits[metric]) {
      classes += ' error'
    }

    return (
      <div className={classes} key={metric}>
        <div className="label">{t(`metrics.${metric}`)}:</div>
        <div className="value">
          {this.props.metrics[metric].toLocaleString()}
          <span className="value-limit">/{this.props.limits[metric].toLocaleString()}</span>{' '}
        </div>
      </div>
    )
  }

  render() {
    const { metrics, limits } = this.props
    const { toggle } = this.state
    const exceededMetric = Object.keys(this.props.metrics).find(
      key => metrics[key as keyof SceneMetrics] > limits[key as keyof SceneMetrics]
    )
    let buttonClasses = 'button'
    if (exceededMetric) {
      buttonClasses += ' error'
    }
    return (
      <div className="Metrics" onClick={this.handleClick}>
        <div className={buttonClasses} onClick={this.handleToggle}>
          <SquaresGrid cols={2} rows={2} size="tiny" />
        </div>
        {toggle ? <div className="bubble">{this.renderMetrics()}</div> : null}
        {exceededMetric ? (
          <div className="exceeded-metric" onClick={this.handleToggle}>
            {t('metrics.too_many', { metric: exceededMetric })}
          </div>
        ) : null}
      </div>
    )
  }
}
