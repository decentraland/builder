import * as React from 'react'
import { Field, InputOnChangeData } from 'decentraland-ui'
import { Props, State } from './TextField.types'

export default class TextField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value || ''
  }

  handleChange = (_: any, props: InputOnChangeData) => {
    const { id, onChange } = this.props
    const { value } = props
    this.setState({ value })
    onChange(id, value)
  }

  render() {
    const { id, label, className = '' } = this.props
    const { value } = this.state
    return (
      <div className={`TextField ${className}`}>
        <span className="label">{label}</span>
        <Field id={id} value={value} onChange={this.handleChange} />
      </div>
    )
  }
}
