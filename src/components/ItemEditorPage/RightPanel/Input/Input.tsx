import * as React from 'react'
import { Props, State } from './Input.types'
import './Input.css'

export default class Input extends React.PureComponent<Props, State> {
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, onChange, maxLength } = this.props
    const newValue = event.target.value
    if (value !== newValue) {
      this.setState({ value: maxLength ? newValue.slice(0, maxLength) : newValue })
      onChange(newValue)
    }
  }

  render() {
    const { label, disabled, value } = this.props

    return (
      <div className={`Input ${disabled ? 'is-disabled' : ''}`.trim()}>
        <div className="label">{label}</div>
        <input value={value || ''} onChange={this.handleChange} disabled={disabled} />
      </div>
    )
  }
}
