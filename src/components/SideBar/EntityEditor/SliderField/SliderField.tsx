import * as React from 'react'
import Slider from 'rc-slider'
import { Props, State } from './SliderField.types'
import './SliderField.css'

export default class SliderField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value || 0,
    id: this.props.id || ''
  }

  static getDerivedStateFromProps(props: Props, prevState: State) {
    if (props.value && props.id !== prevState.id) {
      return {
        value: props.value,
        entityName: props.id
      }
    }

    return null
  }

  handleChange = (value: number) => {
    const { onChange } = this.props
    this.setState({ value })
    onChange(value)
  }

  render() {
    const { id, label, className = '', min, max, step } = this.props
    const { value } = this.state
    return (
      <div className={`SliderField ParameterField ${className}`}>
        <div className="container">
          <label htmlFor={id} className="label">
            {label}
          </label>
          <span className="value">{value}</span>
        </div>
        <Slider value={value} onChange={this.handleChange} min={min} max={max} step={step} />
      </div>
    )
  }
}
