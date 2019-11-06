import * as React from 'react'
import { SelectField, DropdownProps } from 'decentraland-ui'
import { Props, State } from './OptionsField.types'

export default class OptionsField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value || this.props.options.length > 0 ? this.props.options[0].value : ''
  }

  handleChange = (_: any, props: DropdownProps) => {
    const { onChange } = this.props
    const value = props.value as string
    this.setState({ value })
    onChange(value)
  }

  render() {
    const { label, options, className = '' } = this.props
    const { value } = this.state
    let selectOptions = options.map(opt => ({ key: opt.value, text: opt.label, value: opt.value }))

    return (
      <div className={`TextField ${className}`}>
        <span className="label">{label}</span>
        <SelectField value={value} options={selectOptions} onChange={this.handleChange} />
      </div>
    )
  }
}
