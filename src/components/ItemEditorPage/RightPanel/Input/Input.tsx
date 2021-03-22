import * as React from 'react'
import { Props } from './Input.types'
import './Input.css'

export default class Input extends React.PureComponent<Props> {
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, maxLength, onChange } = this.props
    const newValue = event.target.value
    if (value !== newValue) {
      onChange(maxLength ? newValue.slice(0, maxLength) : newValue)
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
