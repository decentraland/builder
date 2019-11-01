import * as React from 'react'
import { Radio, RadioProps } from 'decentraland-ui'
import { Props, State } from './BooleanField.types'

export default class BooleanField extends React.PureComponent<Props, State> {
  handleChange = (_: any, props: RadioProps) => {
    const { onChange } = this.props
    const value = !!props.checked

    this.setState({ value })

    onChange(value)
  }

  render() {
    const { label, value, className = '' } = this.props
    return (
      <div className={`NumericField ${className}`}>
        <span className="label">{label}</span>
        <Radio checked={value} onClick={this.handleChange} toggle />
      </div>
    )
  }
}
