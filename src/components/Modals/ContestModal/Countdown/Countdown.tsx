import * as React from 'react'
import { Props, State, Time } from './Countdown.types'

import './Countdown.css'

export default class Countdown extends React.Component<Props, State> {
  state: State = {
    timeout: null,
    diff: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  }

  componentDidMount() {
    this.setCountdownState()
  }

  componentWillUnmount() {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout)
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    const currentUntil = this.props.until && this.props.until.getTime()
    const nextUntil = nextProps.until && nextProps.until.getTime()
    return currentUntil !== nextUntil || this.state !== nextState
  }

  calculateCountDown() {
    const { until } = this.props
    const diff = Math.max(until.getTime() - Date.now(), 0)
    const seconds = Math.floor((diff % Time.Minute) / Time.Second)
    const minutes = Math.floor((diff % Time.Hour) / Time.Minute)
    const hours = Math.floor((diff % Time.Day) / Time.Hour)
    const days = Math.floor(diff / Time.Day)
    return { days, hours, minutes, seconds, diff }
  }

  setCountdownState = () => {
    const newState = this.calculateCountDown()
    const timeout = newState.diff ? setTimeout(() => this.setCountdownState(), Date.now() % 1000) : null
    this.setState({
      ...newState,
      timeout
    })
  }

  getDigit(value: number): string {
    if (value < 10) {
      return '0' + String(value)
    }

    return String(value)
  }

  render() {
    const { days, hours, minutes, seconds } = this.state

    return (
      <div className="Countdown">
        <div className="CountdownDigit">
          <div className="secondary">DAYS</div>
          <div>{this.getDigit(days)}</div>
        </div>
        <div className="secondary"> </div>
        <div className="CountdownDigit">
          <div className="secondary">HOURS</div>
          <div>{this.getDigit(hours)}</div>
        </div>
        <div className="secondary">{':'}</div>
        <div className="CountdownDigit">
          <div className="secondary">MIN</div> <div>{this.getDigit(minutes)}</div>
        </div>
        <div className="secondary">{':'}</div>
        <div className="CountdownDigit">
          <div className="secondary">SEC</div> <div>{this.getDigit(seconds)}</div>
        </div>
      </div>
    )
  }
}
