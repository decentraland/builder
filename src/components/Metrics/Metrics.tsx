import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import SquaresGrid from 'components/SquaresGrid'
import Icon from 'components/Icon'
import { SceneMetrics } from 'modules/scene/types'
import { Props, State } from './Metrics.types'
import './Metrics.css'
import { getDimensions } from 'lib/layout'

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
      classes += ' exceeded'
    }

    return (
      <div className={classes} key={metric}>
        <div className="label">{t(`metrics.${metric}`)}:</div>
        <div className="value">
          {this.props.metrics[metric].toLocaleString()}
          <span className="value-limit">&nbsp;/&nbsp;{this.props.limits[metric].toLocaleString()}</span>{' '}
        </div>
      </div>
    )
  }

  render() {
    const { rows, cols, metrics, limits } = this.props
    const { toggle } = this.state
    const exceededMetric = Object.keys(this.props.metrics).find(
      key => metrics[key as keyof SceneMetrics] > limits[key as keyof SceneMetrics]
    )

    return (
      <div className={`Metrics ${exceededMetric ? 'metric-exceeded' : ''}`} onClick={this.handleClick}>
        <SquaresGrid cols={2} rows={2} size="tiny" onClick={this.handleToggle} />
        {toggle ? (
          <div className="bubble">
            <div className="bubble-title">
              <span>
                {rows}x{cols} LAND
              </span>
              &nbsp;
              <span className="dimensions">{getDimensions(rows, cols)}</span>
            </div>
            <div className="divider" />
            {this.renderMetrics()}
          </div>
        ) : null}
        {exceededMetric ? (
          <span className="value-too-high" onClick={this.handleToggle}>
            <Icon name="alert" />
            {t('metrics.too_many', { metric: exceededMetric })}
          </span>
        ) : null}
      </div>
    )
  }
}
