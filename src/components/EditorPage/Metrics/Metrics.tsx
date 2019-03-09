import * as React from 'react'
import { Popup } from 'decentraland-ui'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import SquaresGrid from 'components/SquaresGrid'
import Icon from 'components/Icon'
import { ClosePopup } from 'components/Popups'
import { SceneMetrics } from 'modules/scene/types'
import { getDimensions } from 'lib/layout'
import { Props, State } from './Metrics.types'
import './Metrics.css'

export const LOCALSTORAGE_METRICS_POPUP_KEY = 'builder-metrics-popup'
const localStorage = getLocalStorage()

export default class Metrics extends React.PureComponent<Props, State> {
  state = {
    isBubbleVisible: false,
    isMetricsPopupOpen: !localStorage.getItem(LOCALSTORAGE_METRICS_POPUP_KEY)
  }

  analytics = getAnalytics()
  metricsExceeded: (keyof SceneMetrics)[] = []

  componentWillMount() {
    document.addEventListener('click', this.handleClose)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClose)
  }

  componentWillReceiveProps(nextProps: Props) {
    for (let key in nextProps.metrics) {
      const metric = key as keyof SceneMetrics
      if (nextProps.metrics[metric] > nextProps.limits[metric]) {
        if (!this.metricsExceeded.includes(metric)) {
          this.metricsExceeded.push(metric)
          this.analytics.track('Metrics exceeded', { metric })
        }
      } else {
        this.metricsExceeded = this.metricsExceeded.filter(exceeded => exceeded !== metric)
      }
    }
  }

  handleToggle = () => {
    const isBubbleVisible = !this.state.isBubbleVisible

    if (isBubbleVisible) {
      this.analytics.track('Show metrics')
    }
    this.setState({ isBubbleVisible })
  }

  handleClose = () => {
    this.setState({ isBubbleVisible: false })
  }

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.nativeEvent.stopImmediatePropagation()
    this.handleCloseMetricsPopup()
  }

  handleCloseMetricsPopup = () => {
    this.setState({ isMetricsPopupOpen: false })
    localStorage.setItem(LOCALSTORAGE_METRICS_POPUP_KEY, '1')
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
    const { isBubbleVisible, isMetricsPopupOpen } = this.state
    const exceededMetric = Object.keys(this.props.metrics).find(
      key => metrics[key as keyof SceneMetrics] > limits[key as keyof SceneMetrics]
    )

    return (
      <div className={`Metrics ${exceededMetric ? 'metric-exceeded' : ''}`} onClick={this.handleClick}>
        <Popup
          open={isMetricsPopupOpen}
          content={<ClosePopup text={t('popups.metrics_help')} onClick={this.handleCloseMetricsPopup} />}
          position="top left"
          trigger={
            <span>
              <SquaresGrid rows={2} cols={2} size="tiny" onClick={this.handleToggle} />
            </span>
          }
          inverted
        />

        {isBubbleVisible ? (
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
