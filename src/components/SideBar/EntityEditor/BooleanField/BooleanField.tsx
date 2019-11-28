import * as React from 'react'
import { Radio, RadioProps } from 'decentraland-ui'
import { Props } from './BooleanField.types'
import './BooleanField.css'

export default class BooleanField extends React.PureComponent<Props> {
  handleChange = (_: any, props: RadioProps) => {
    const { onChange } = this.props
    const value = !!props.checked
    onChange(value)
  }

  render() {
    const { id, label, value, className = '' } = this.props
    return (
      <div className={`BooleanField ParameterField ${className}`}>
        <label htmlFor={id} className="label">
          {label}
        </label>
        <Radio id={id} checked={value} onClick={this.handleChange} toggle />
      </div>
    )
  }
}
