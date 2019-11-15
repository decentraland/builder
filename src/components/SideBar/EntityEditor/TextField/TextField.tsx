import * as React from 'react'
import { Field, InputOnChangeData } from 'decentraland-ui'
import { Props, State } from './TextField.types'
import './TextField.css'

export default class TextField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value || '',
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
    const { onChange } = this.props
    const { value } = props
    this.setState({ value })
    onChange(value)
  }

  render() {
    const { id, label, className = '' } = this.props
    const { value } = this.state

    return (
      <div className={`TextField ParameterField ${className}`}>
        <label htmlFor={id} className="label">
          {label}
        </label>
        <Field id={id} value={value} onChange={this.handleChange} />
      </div>
    )
  }
}
