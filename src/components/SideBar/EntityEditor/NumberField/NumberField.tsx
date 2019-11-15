import * as React from 'react'
import { Field, InputOnChangeData } from 'decentraland-ui'
import { Props, State } from './NumberField.types'
import './NumberField.css'

export default class NumberField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value ? this.props.value.toString() : ''
  }

  static getDerivedStateFromProps(props: Props) {
    if (props.value) {
      return {
        value: props.value
      }
    }

    return null
  }

  handleChange = (_: any, props: InputOnChangeData) => {
    const { allowFloat, onChange } = this.props
    const value = allowFloat ? props.value : props.value.replace(/,|\./g, '')
    this.setState({ value })

    onChange(allowFloat ? parseFloat(value) : parseInt(value, 10))
  }

  render() {
    const { label, className = '' } = this.props
    const { value } = this.state
    return (
      <div className={`NumberField ParameterField ${className}`}>
        <span className="label">{label}</span>
        <Field value={value} onChange={this.handleChange} type="number" />
      </div>
    )
  }
}
