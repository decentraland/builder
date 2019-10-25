import * as React from 'react'
import { Field, InputOnChangeData } from 'decentraland-ui'
import { Props, State } from './NumberField.types'

export default class NumberField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value ? this.props.value.toString() : ''
  }

  handleChange = (_: any, props: InputOnChangeData) => {
    const { id, allowFloat, onChange } = this.props
    const value = allowFloat ? props.value : props.value.replace(/,|\./g, '')
    console.log(value)
    this.setState({ value })

    onChange(id, allowFloat ? parseFloat(value) : parseInt(value, 10))
  }

  render() {
    const { id, label, className = '' } = this.props
    const { value } = this.state
    return (
      <div className={`NumberField ${className}`}>
        <span className="label">{label}</span>
        <Field id={id} value={value} onChange={this.handleChange} type="number" autofill="off" />
      </div>
    )
  }
}
