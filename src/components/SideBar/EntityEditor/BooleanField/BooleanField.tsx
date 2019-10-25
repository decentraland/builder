import * as React from 'react'
import { Radio, RadioProps } from 'decentraland-ui'
import { Props, State } from './BooleanField.types'

export default class BooleanField extends React.PureComponent<Props, State> {
  handleChange = (_: any, props: RadioProps) => {
    const { id, onChange } = this.props
    const value = !!props.checked

    this.setState({ value })

    onChange(id, value)
  }

  render() {
    const { id, label, value, className = '' } = this.props
    return (
      <div className={`NumericField ${className}`}>
        <span className="label">{label}</span>
        <Radio id={id} toggle checked={value} onClick={this.handleChange} />
      </div>
    )
  }
}
