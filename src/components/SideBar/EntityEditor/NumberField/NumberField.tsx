import * as React from 'react'
import { Field, InputOnChangeData } from 'decentraland-ui'
import { Props, State } from './NumberField.types'
import './NumberField.css'

export default class NumberField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value !== undefined ? this.props.value.toString() : '0',
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

  handleChange = (_: any, props: InputOnChangeData) => {
    const { allowFloat, onChange } = this.props
    const value = allowFloat ? props.value : props.value.replace(/,|\./g, '')
    this.setState({ value })

    onChange(allowFloat ? parseFloat(value) : parseInt(value, 10))
  }

  render() {
    const { id, label, className = '' } = this.props
    const { value } = this.state
    return (
      <div className={`NumberField ParameterField ${className}`}>
        <label htmlFor={id} className="label">
          {label}
        </label>
        <Field id={id} value={value} onChange={this.handleChange} type="number" />
      </div>
    )
  }
}
