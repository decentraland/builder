import * as React from 'react'
import { Props, State } from './Input.types'
import './Input.css'

export default class Input extends React.PureComponent<Props, State> {
  static defaultProps = {
    disabled: false
  }

  state: State = {
    value: this.props.value || ''
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.itemId !== this.props.itemId) {
      this.setState({ value: newProps.value || '' })
    }
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, onChange } = this.props
    const newValue = event.target.value
    if (value !== newValue) {
      this.setState({ value: newValue })
      onChange(newValue)
    }
  }

  render() {
    const { label, disabled } = this.props

    return (
      <div className={`Input ${disabled ? 'is-disabled' : ''}`.trim()}>
        <div className="label">{label}</div>
        <input value={this.state.value} onChange={this.handleChange} disabled={disabled} />
      </div>
    )
  }
}
