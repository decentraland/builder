import * as React from 'react'
import { Field, InputOnChangeData } from 'decentraland-ui'
import { Props, State } from './TextField.types'
import './TextField.css'

export default class TextField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value || ''
  }

  handleChange = (_: any, props: InputOnChangeData) => {
    const { onChange } = this.props
    const { value } = props
    this.setState({ value })
    setTimeout(() => onChange(value), 0)
  }

  render() {
    const { label, className = '' } = this.props
    const { value } = this.state

    return (
      <div className={`TextField ParameterField ${className}`}>
        <span className="label">{label}</span>
        <Field value={value} onChange={this.handleChange} />
      </div>
    )
  }
}
