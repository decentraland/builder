import * as React from 'react'
import { TextArea, TextAreaProps } from 'decentraland-ui'
import { Props, State } from './TextAreaField.types'

import './TextAreaField.css'

export default class TextAreaField extends React.PureComponent<Props, State> {
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

  handleChange = (_: any, props: TextAreaProps) => {
    const { onChange } = this.props
    const value = props.value as string
    this.setState({ value })
    onChange(value)
  }

  render() {
    const { id, label, className = '' } = this.props
    const { value } = this.state

    return (
      <div className={`TextAreaField ParameterField ${className}`}>
        <label htmlFor={id} className="label">
          {label}
        </label>
        <TextArea id={id} value={value} onChange={this.handleChange} autocorrect="off" autocapitalize="off" spellcheck="false" />
      </div>
    )
  }
}
