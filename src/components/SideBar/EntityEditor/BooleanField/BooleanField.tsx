import * as React from 'react'
import { Radio, RadioProps } from 'decentraland-ui'
import { Props } from './BooleanField.types'
import './BooleanField.css'

export default class BooleanField extends React.PureComponent<Props> {
  handleChange = (_: any, props: RadioProps) => {
    const { onChange } = this.props
    const value = !!props.checked
    setTimeout(() => onChange(value), 0)
  }

  render() {
    const { label, value, className = '' } = this.props
    return (
      <div className={`BooleanField ParameterField ${className}`}>
        <span className="label">{label}</span>
        <Radio checked={value} onClick={this.handleChange} toggle />
      </div>
    )
  }
}
